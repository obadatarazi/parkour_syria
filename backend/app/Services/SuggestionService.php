<?php

namespace App\Services;

use App\Enum\EventType;
use App\Enum\SuggestionStatus;
use App\Enum\SuggestionType;
use App\Models\DirectoryEntry;
use App\Models\Event;
use App\Models\Suggestion;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class SuggestionService extends BaseService
{
    const UPLOAD_FOLDER = 'suggestions';

    public function __construct(
        protected DirectoryEntryService $directoryEntryService,
        protected EventService $eventService,
        protected FileSystemService $fileSystemService,
        UploadFileService $uploadFileService,
    ) {
        $this->model = Suggestion::class;
        $this->withRelations = ['area.translations', 'reviewer'];
        // Only read by delete(): the visitor's photo goes with the suggestion.
        $this->keyFileMaps = ['image_file_url' => 'image'];
        $this->uploadFileService = $uploadFileService;
        parent::__construct();
    }

    /**
     * What a visitor sends. It always starts pending, whatever the request carries.
     */
    public function submit(array $data, ?string $ipAddress): Suggestion
    {
        $image = $data['image'] ?? null;
        unset($data['image']);

        $suggestion = new Suggestion($data);
        if (is_object($image)) {
            $suggestion->image_file_url = $this->fileSystemService->uploadFile($image, self::UPLOAD_FOLDER)['fileUrl'];
        }
        $suggestion->status = SuggestionStatus::PENDING->value;
        $suggestion->ip_address = $ipAddress;
        $suggestion->save();

        return $suggestion;
    }

    /**
     * Only a pending suggestion can still be edited, an accepted one already lives on as a
     * directory entry or event and is edited there.
     */
    public function update($data, Model $object): Suggestion
    {
        $this->ensurePending($object);

        $object->update($data);

        return $object->load($this->withRelations);
    }

    /**
     * Promotes the suggestion into the directory (place / coach / team) or the events, in one
     * transaction with the status change so a failure leaves the suggestion pending.
     *
     * @param array<string, mixed> $overrides validated SuggestionAcceptRequest
     */
    public function accept(Suggestion $suggestion, array $overrides, User $reviewer): Suggestion
    {
        $this->ensurePending($suggestion);

        return DB::transaction(function () use ($suggestion, $overrides, $reviewer) {
            $type = SuggestionType::from($suggestion->type);

            $promoted = $type->isEvent()
                ? $this->promoteToEvent($suggestion, $overrides)
                : $this->promoteToDirectoryEntry($suggestion, $type, $overrides);

            if ($suggestion->image_file_url) {
                $folder = $type->isEvent() ? EventService::UPLOAD_FOLDER : DirectoryEntryService::UPLOAD_FOLDER;
                $promoted->image_file_url = $this->fileSystemService->copyFile($suggestion->image_file_url, $folder);
                $promoted->save();
            }

            $suggestion->status = SuggestionStatus::ACCEPTED->value;
            $suggestion->reject_reason = null;
            $suggestion->reviewed_by = $reviewer->id;
            $suggestion->reviewed_at = now();
            $suggestion->promoted_type = $promoted->getTable();
            $suggestion->promoted_id = $promoted->getKey();
            $suggestion->save();

            return $suggestion->load($this->withRelations);
        });
    }

    public function reject(Suggestion $suggestion, string $reason, User $reviewer): Suggestion
    {
        $this->ensurePending($suggestion);

        $suggestion->status = SuggestionStatus::REJECTED->value;
        $suggestion->reject_reason = $reason;
        $suggestion->reviewed_by = $reviewer->id;
        $suggestion->reviewed_at = now();
        $suggestion->save();

        return $suggestion->load($this->withRelations);
    }

    protected function promoteToDirectoryEntry(Suggestion $suggestion, SuggestionType $type, array $overrides): DirectoryEntry
    {
        return $this->directoryEntryService->create([
            'type' => $type->value,
            'slug' => $overrides['slug'] ?? null,
            'area_id' => $suggestion->area_id,
            'whatsapp' => $this->whatsAppNumber($suggestion->contact),
            'verified' => (bool) ($overrides['verified'] ?? false),
            'publish' => (bool) ($overrides['publish'] ?? true),
            'ar' => [
                'name' => $suggestion->name,
                'description' => $suggestion->description,
            ],
        ]);
    }

    protected function promoteToEvent(Suggestion $suggestion, array $overrides): Event
    {
        $startsAt = $overrides['starts_at'] ?? $suggestion->starts_at;

        abort_if(empty($startsAt), 422, __('exceptions.suggestion_event_needs_date'));

        return $this->eventService->create([
            'type' => $overrides['event_type'] ?? EventType::GATHERING->value,
            'slug' => $overrides['slug'] ?? null,
            'starts_at' => $startsAt,
            'area_id' => $suggestion->area_id,
            'contact' => $suggestion->contact,
            'publish' => (bool) ($overrides['publish'] ?? true),
            'ar' => [
                'title' => $suggestion->name,
                'description' => $suggestion->description,
            ],
        ]);
    }

    /**
     * The contact field is free text (a WhatsApp number or a Facebook link). Only a number makes a
     * usable WhatsApp button on the directory card.
     */
    protected function whatsAppNumber(?string $contact): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $contact);

        return strlen($digits) >= 8 && strlen($digits) <= 15 ? $digits : null;
    }

    protected function ensurePending(Model $suggestion): void
    {
        abort_if(
            $suggestion->status !== SuggestionStatus::PENDING->value,
            422,
            __('exceptions.suggestion_already_reviewed')
        );
    }
}

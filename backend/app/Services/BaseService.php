<?php
namespace App\Services;

use App\Http\QueryFilter\QueryFilter;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

abstract class BaseService
{
    const UPLOAD_FOLDER = 'others';
    protected $model;
    protected $keyFileMaps = [];
    protected $uploadFileService;
    protected $withRelations = [];

    /**
     * The relations a listing needs, which are rarely the ones a single record needs. A table row
     * shows a handful of columns while a show page draws the whole graph, and loading the graph for
     * every row of every page is what makes a list slow.
     *
     * A service that leaves this null lists with `$withRelations`, which is the right thing for the
     * small flat tables (brands, tags, countries, settings) where the two are genuinely the same.
     * Only a service whose records carry a deep graph has a reason to declare it.
     *
     * @var array|null
     */
    protected $listRelations = null;

    /**
     * Relations a listing counts instead of loading. A row that only prints how many children a
     * record has has no reason to bring those children down, and `withCount` answers it in the
     * listing query itself.
     *
     * @var array<int|string, mixed>
     */
    protected $listCounts = [];

    /**
     * The largest page a listing will answer with, whatever the caller asked for. A page size is
     * client input like any other, and without a ceiling one request can ask for the whole table
     * and drag its relations down with it — the cost of a page is the page size times the graph
     * behind every row.
     *
     * 200 is the widest page any client asks for (the role, state and country option lists),
     * and every API answers with at most that many rows.
     */
    public const MAX_PAGE_LIMIT = 200;

    public function __construct()
    {
    }

    /**
     * The page number asked for, never below the first page.
     *
     * @param array<string, mixed> $filters
     */
    protected function resolvePage(array $filters): int
    {
        return max((int) ($filters['page'] ?? 1), 1);
    }

    /**
     * The page size asked for, clamped into what this listing is willing to answer with. A caller
     * asking for more is served the maximum rather than refused: the page is smaller than it asked
     * for, and the pagination block it reads back says so.
     *
     * @param array<string, mixed> $filters
     * @param int|null $max Null uses this service's ceiling.
     */
    protected function resolveLimit(array $filters, ?int $max = null): int
    {
        $limit = max((int) ($filters['limit'] ?? 10), 1);

        return min($limit, $max ?? static::MAX_PAGE_LIMIT);
    }

    public function findAllPaginated(QueryFilter $modelFilter)
    {
        $filters = $modelFilter->getFiltersFields();
        $page = $this->resolvePage($filters);
        $limit = $this->resolveLimit($filters);

        $query = $this->model::query()->with($this->getListRelations())->filter($modelFilter);

        if (!empty($this->listCounts)) {
            $query->withCount($this->listCounts);
        }

        return $query->paginate($limit, ['*'], 'page', $page);
    }

    public function findAllPaginatedByUser(QueryFilter $modelFilter, $user)
    {
        $modelFilter->setFilter('userId', $user->id);

        return $this->findAllPaginated($modelFilter);
    }

    public function getWithRelations(): array
    {
        return $this->withRelations;
    }

    /**
     * The relations to load when many records are read at once.
     */
    public function getListRelations(): array
    {
        return $this->listRelations ?? $this->withRelations;
    }

    public function findAllPublished(QueryFilter $modelFilter)
    {
        $modelFilter->setFilter('publish', true);

        return $this->findAllPaginated($modelFilter);
    }

    /**
     * One published record by a unique column (a slug, a page key). An unpublished record answers
     * exactly like one that does not exist, the website must not be able to tell them apart.
     */
    public function findPublishedBy(string $column, $value): Model
    {
        return $this->model::query()
            ->with($this->getWithRelations())
            ->where($column, $value)
            ->where('publish', true)
            ->firstOrFail();
    }

    public function create($data)
    {
        $object = new $this->model($data);

        if (!empty($this->keyFileMaps)) {
            $this->uploadFileService->uploadFiles(
                $data,
                $this->keyFileMaps,
                $object,
                $this::UPLOAD_FOLDER
            );
        }

        $object->save();

        return $object;
    }

    public function update($data, Model $object)
    {
        $object->update($data);

        if (!empty($this->keyFileMaps)) {
            $this->uploadFileService->updateFiles(
                $data,
                $this->keyFileMaps,
                $object,
                $this::UPLOAD_FOLDER
            );
        }

        $object->save();

        return $object;
    }

    /**
     * The listing an export walks: the same rows the index would answer with, under the same
     * filters, but carrying the relations the csv has columns for instead of the ones a table row
     * draws, and unpaginated.
     *
     * @see \App\Services\CsvExportService
     */
    public function exportQuery(QueryFilter $modelFilter)
    {
        return $this->model::query()
            ->with(app(CsvExportService::class)->relations(new $this->model()))
            ->filter($modelFilter);
    }

    /**
     * Deletes many records in one call, each one through the service's own delete(), so whatever a
     * single delete does — removing the uploaded files, cascading into images and variants, keeping
     * a last-of-its-kind row alive — happens here too.
     *
     * The whole set is written in one transaction: either every id given is gone or none is, which
     * is what a dashboard that just asked to delete a selection expects. Ids that match no row are
     * not an error, they are reported back in `notFoundIds` — the row a second admin deleted a
     * moment earlier should not fail the rest of the selection.
     *
     * @param array<int, int|string> $ids
     * @param array<string, mixed> $scope Extra column constraints, used by the nested resources to
     *                                    keep a bulk delete inside its parent.
     * @return array{deletedCount: int, deletedIds: list<int>, notFoundIds: list<int>}
     */
    public function bulkDelete(array $ids, array $scope = []): array
    {
        $ids = array_values(array_unique(array_map('intval', $ids)));

        if (empty($ids)) {
            return ['deletedCount' => 0, 'deletedIds' => [], 'notFoundIds' => []];
        }

        $query = $this->model::query()
            ->with($this->getWithRelations())
            ->whereIn((new $this->model())->getQualifiedKeyName(), $ids);

        foreach ($scope as $column => $value) {
            $query->where($column, $value);
        }

        $objects = $query->get();
        $deletedIds = array_map('intval', $objects->modelKeys());

        DB::transaction(function () use ($objects) {
            foreach ($objects as $object) {
                $this->delete($object);
            }
        });

        return [
            'deletedCount' => count($deletedIds),
            'deletedIds' => $deletedIds,
            'notFoundIds' => array_values(array_diff($ids, $deletedIds)),
        ];
    }

    public function delete(Model $object): void
    {
        if (!empty($this->keyFileMaps)) {
            $paths = [];
            foreach ($this->keyFileMaps as $fileModelKey => $fileRequestKey) {

                if (!is_null($object->$fileModelKey)) {
                    $paths[] = $object->$fileModelKey;
                }

            }
            $this->uploadFileService->removeFiles($paths);

        }

        $object->delete();
    }

}

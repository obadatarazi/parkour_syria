import type { MongoAbility } from "@casl/ability";

import type { Permission } from "@/shared/constants/permissions";

export type AppAbility = MongoAbility<[Permission | string, "all"]>;

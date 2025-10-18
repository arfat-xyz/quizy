import { PaginationExample } from "@/components/feature/examples/paginationExample";
import { metaDataGeneratorForNormalPage } from "@/lib/generate-meta";
export const metadata = metaDataGeneratorForNormalPage(
  "Settings - Arfat",
  "Manage your settings and preferences on Arfat.",
);
const page = () => {
  return (
    <div>
      <PaginationExample />
    </div>
  );
};

export default page;

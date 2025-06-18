import AuthorizedOr, { AuthorizedOrProps } from "@/components/ui/AuthorizedOr";
import PageBody from "@/components/ui/PageBody";
import SearchBar, { SearchProps } from "@/components/ui/SearchBar";
import { projectVariants } from "@/constants/shared-component-styles";
import ControlPanelBreadcrumbItem from "./ControlPanelBreadcrumbItem";

const { padding } = projectVariants;

interface Props extends BaseProps, SearchProps, AuthorizedOrProps {
  padding?: keyof typeof padding;
  [key: string]: any;
}

export default function DashBoardBody({
  children,
  breadcrumb,
  padding = "md",
  term,
  onSubmit,
  setSkip,
  setPageSize,
  placeholder,
  commandPalette,
  authorized,
  isLoading,
}: Props) {
  return (
    <PageBody padding={padding} width="full">
      {breadcrumb && (
        <PageBody.Breadcrumb>
          <ControlPanelBreadcrumbItem />
          {breadcrumb}
        </PageBody.Breadcrumb>
      )}

      <PageBody.Content padding="md" flex="col" gap={1}>
        <SearchBar
          term={term}
          onSubmit={onSubmit}
          setSkip={setSkip}
          setPageSize={setPageSize}
          placeholder={placeholder}
          commandPalette={commandPalette}
        />

        <AuthorizedOr authorized={authorized} isLoading={isLoading}>
          {children}
        </AuthorizedOr>
      </PageBody.Content>
    </PageBody>
  );
}

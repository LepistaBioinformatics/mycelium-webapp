import AuthorizedOr, { AuthorizedOrProps } from "@/components/ui/AuthorizedOr";
import PageBody from "@/components/ui/PageBody";
import SearchBar, { SearchProps } from "@/components/ui/SearchBar";
import { projectVariants } from "@/constants/shared-component-styles";

const { padding } = projectVariants;

interface Props extends BaseProps, SearchProps, AuthorizedOrProps {
  padding?: keyof typeof padding;
  [key: string]: any;
}

export default function DashBoardBody({
  children,
  breadcrumb,
  padding = "md",
  ...props
}: Props) {
  return (
    <PageBody padding={padding}>
      {breadcrumb && (
        <PageBody.Breadcrumb>
          <PageBody.Breadcrumb.Item>
            Control panel
          </PageBody.Breadcrumb.Item>
          {breadcrumb}
        </PageBody.Breadcrumb>
      )}

      <PageBody.Content>
        <SearchBar {...props} />

        <AuthorizedOr {...props}>
          {children}
        </AuthorizedOr>
      </PageBody.Content>
    </PageBody>
  )
}

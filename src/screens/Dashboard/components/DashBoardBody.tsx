import AuthorizedOr, { AuthorizedOrProps } from "@/components/ui/AuthorizedOr";
import PageBody from "@/components/ui/PageBody";
import SearchBar, { SearchProps } from "@/components/ui/SearchBar";

interface Props extends BaseProps, SearchProps, AuthorizedOrProps {
  breadcrumb: React.ReactNode;
  [key: string]: any;
}

export default function DashBoardBody({ children, breadcrumb, ...props }: Props) {
  return (
    <PageBody padding="md">
      <PageBody.Breadcrumb>
        <PageBody.Breadcrumb.Item>
          Control panel
        </PageBody.Breadcrumb.Item>
        {breadcrumb}
      </PageBody.Breadcrumb>

      <PageBody.Content>
        <SearchBar {...props} />

        <AuthorizedOr {...props}>
          {children}
        </AuthorizedOr>
      </PageBody.Content>
    </PageBody>
  )
}

import AuthorizedOr from "@/components/ui/AuthorizedOr";
import PageBody from "@/components/ui/PageBody";
import useProfile from "@/hooks/use-profile";

export default function Staff() {
  const { profile, isLoadingUser } = useProfile();

  return (
    <PageBody padding="md" height="fit">
      <PageBody.Breadcrumb>
        <PageBody.Breadcrumb.Item>
          Control panel
        </PageBody.Breadcrumb.Item>
        <PageBody.Breadcrumb.Item>
          Staff screen
        </PageBody.Breadcrumb.Item>
      </PageBody.Breadcrumb>

      <PageBody.Content flex gap={5} padding="md">
        <AuthorizedOr authorized={!isLoadingUser && profile?.isStaff}>
          Content
        </AuthorizedOr>
      </PageBody.Content>
    </PageBody>
  );
}

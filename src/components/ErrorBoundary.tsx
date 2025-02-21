import { useRouteError } from "react-router";
import PageBody from "./ui/PageBody";
import Card from "./ui/Card";
import Typography from "./ui/Typography";

export default function ErrorBoundary() {
  const error = useRouteError();

  return (
    <PageBody padding="sm">
      <Card padding="sm">
        <Card.Header>
          <Typography as="title">Error</Typography>
        </Card.Header>

        <Card.Body>
          <Typography as="span">{error as string}</Typography>

          <img
            src="/undraw.co/undraw_server-down_lxs9.svg"
            alt="Unexpected error"
            width={250}
            height={250}
            className="mt-4 mx-auto"
          />
        </Card.Body>
      </Card>
    </PageBody>
  );
};

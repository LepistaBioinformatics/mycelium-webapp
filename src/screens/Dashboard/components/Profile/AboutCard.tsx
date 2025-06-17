import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { IconType } from "react-icons";
import { Link } from "react-router";

interface Props extends BaseProps {
  title: string;
  subtitle: string;
  icon: IconType | any;
  headerTitle: string;
  links: {
    label: string;
    to: string;
  }[];
  aboutContent: React.ReactNode;
}

export default function AboutCard({
  title,
  subtitle,
  icon,
  headerTitle,
  links,
  aboutContent,
}: Props) {
  const Icon = icon;

  return (
    <Card padding="sm" width="full">
      <Card.Header>
        <Typography as="h5" uppercase>
          <div
            title={headerTitle}
            className="flex items-center gap-2 text-blue-500 dark:text-lime-500 hover:cursor-help"
          >
            <Icon className="hover:cursor-help" />
            {title}
          </div>
        </Typography>
        <Typography as="h6" decoration="smooth">
          {subtitle}
        </Typography>
      </Card.Header>

      <Card.Body>
        <div className="flex flex-col gap-2">
          {links.length > 0 && (
            <div>
              <Typography
                as="span"
                decoration="smooth"
                title="Pages containing exclusive actions"
              >
                Visit exclusive pages
              </Typography>
              <Typography as="div">
                <div className="flex flex-col gap-1">
                  {links.map((link, index) => (
                    <Link
                      key={index}
                      to={link.to}
                      className="text-blue-500 dark:text-lime-500 hover:cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </Typography>
            </div>
          )}

          <div className="mb-24">
            <Typography as="span" decoration="smooth">
              About
            </Typography>

            {aboutContent}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { IconType } from "react-icons";
import { Link } from "react-router";

interface Props extends BaseProps {
  title: string;
  subtitle: string;
  icon: IconType | any;
  iconTitle: string;
  links: {
    label: string;
    to: string;
  }[];
  aboutContent: React.ReactNode;
}

export default function AboutCard({ title, subtitle, icon, iconTitle, links, aboutContent }: Props) {
  const Icon = icon;

  return (
    <Card minHeight="40vh" maxHeight="40vh" padding="sm" width="6xl">
      <Card.Header>
        <Typography as="h5" uppercase>
          <div className="flex items-center gap-2">
            <Icon
              title={iconTitle}
              className="text-blue-500 dark:text-lime-500 hover:cursor-help"
            />
            {title}
          </div>
        </Typography>
        <Typography as="h6" decoration="smooth">
          {subtitle}
        </Typography>
      </Card.Header>

      <Card.Body>
        <div className="flex flex-col gap-2">
          <div>
            <Typography
              as="span"
              decoration="smooth"
              title="Pages containing exclusive actions"
            >
              Visit exclusive pages
            </Typography>
            <Typography as="p">
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

          <div>
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

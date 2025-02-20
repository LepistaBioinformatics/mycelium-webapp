interface Props {
  orOption?: boolean;
}

export default function Divider({ orOption }: Props) {

  if (orOption) {
    return (
      <div className="flex w-full items-center justify-between py-12 text-gray-50 dark:text-gray-200">
        <hr className="w-full" />
        <span className="px-2 uppercase">or</span>
        <hr className="w-full" />
      </div>
    );
  }

  return <hr className="w-full" />
}

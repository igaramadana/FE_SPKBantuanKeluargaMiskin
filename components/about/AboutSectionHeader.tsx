type AboutSectionHeaderProps = {
  title: string;
  description: string;
};

export function AboutSectionHeader({
  title,
  description,
}: AboutSectionHeaderProps) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-3xl font-bold text-[#1B5E20] md:text-4xl">
        {title}
      </h2>

      <p className="mt-5 text-base leading-8 text-black md:text-lg">
        {description}
      </p>
    </div>
  );
}
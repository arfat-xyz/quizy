export const metaDataGeneratorForNormalPage = (
  title: string = `Arfatur Rahman`,
  description: string = `Arfatur Rahman`,
) => {
  return {
    title: `${title} |  | Full stack | AI Enthusiast`,
    description,
    image: `/logo.jpeg`,
    openGraph: {
      images: [`logo.jpeg`],
    },
  };
};

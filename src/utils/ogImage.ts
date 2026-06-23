type ImageLike = string | { src?: string } | undefined | null;

const getOgImageUrl = (image: ImageLike) => {
  if (typeof image === "string") return image;
  return image?.src;
};

export const resolveOgImage = (image: ImageLike, origin: string) => {
  const imageUrl = getOgImageUrl(image);
  return imageUrl ? new URL(imageUrl, origin).href : undefined;
};

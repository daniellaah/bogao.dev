type ImageLike = string | { src?: string } | undefined | null;

export const resolveOgImage = (image: ImageLike, origin: string) => {
  const imageUrl = typeof image === "string" ? image : image?.src;
  return imageUrl ? new URL(imageUrl, origin).href : undefined;
};

import publicImageDimensions from "@/data/public-image-dimensions.json";

type ImageDimensions = {
  width: number;
  height: number;
};

const PUBLIC_IMAGE_DIMENSIONS = publicImageDimensions as Record<
  string,
  ImageDimensions
>;

export const getPublicImageDimensions = (
  src: string | undefined
): ImageDimensions | undefined =>
  src ? PUBLIC_IMAGE_DIMENSIONS[src] : undefined;

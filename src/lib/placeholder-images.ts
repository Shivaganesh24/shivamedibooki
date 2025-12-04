import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// The JSON file is an object with a 'placeholderImages' key which is the array.
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

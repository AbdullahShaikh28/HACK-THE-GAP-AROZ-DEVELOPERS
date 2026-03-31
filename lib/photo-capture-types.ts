export type PhotoLocationSource = "gps" | "exif";

export type PhotoCaptureValue = {
  file: File;
  previewUrl: string;
  latitude: number | null;
  longitude: number | null;
  accuracyM: number | null;
  locationSource: PhotoLocationSource | null;
};

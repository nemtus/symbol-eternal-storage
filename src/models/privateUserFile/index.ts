export interface PrivateUserFile {
  fileId: string;

  // Note: OpenSea Metadata Standards for ERC721 https://docs.opensea.io/docs/metadata-standards
  fileName: string; // Note: this is derived with storage for firebase
  fileDescription: string;
  fileImage: string;
  fileExternalUrl: string;
  fileAnimationUrl: string;
  fileYoutubeUrl: string;
  fileAttributes: OpenSeaAttribute[];

  // Note: File metadata on storage for firebase
  fileBucket: string;
  fileGeneration: string;
  fileMetaGeneration: string;
  fileFullPath: string;
  fileSize: number;
  fileTimeCreated: string;
  fileUpdated: string;
  fileMd5Hash: string;
  fileCacheControl: string;
  fileContentDisposition: string;
  fileContentEncoding: string;
  fileContentLanguage: string;
  fileMimeType: string; // Note: this is called contentType in storage for firebase
}

type OpenSeaAttribute =
  | OpenSeaStringAttribute
  | OpenSeaNumberAttribute
  | OpenSeaBoostNumberAttribute
  | OpenSeaBoostPercentageAttribute
  | OpenSeaDateAttribute
  | OpenSeaOnlyValueAttribute;

type OpenSeaStringAttribute = {
  traitType: string;
  value: string;
};

type OpenSeaNumberAttribute = {
  displayType: 'number';
  traitType: string;
  value: number;
};

type OpenSeaBoostNumberAttribute = {
  displayType: 'boost_number';
  traitType: string;
  value: number;
};

type OpenSeaBoostPercentageAttribute = {
  displayType: 'boost_percentage';
  traitType: string;
  value: number;
};

type OpenSeaDateAttribute = {
  displayType: 'date';
  traitType: string;
  value: number; // Note: Unix timestamp (seconds)
};

type OpenSeaOnlyValueAttribute = {
  value: string | number; // Note: I don't know well. Only string and number?
};

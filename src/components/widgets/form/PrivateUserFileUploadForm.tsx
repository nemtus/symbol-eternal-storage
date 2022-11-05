import React from 'react';
import { privateUserFileCollection } from '../../../utils/firebase/firestore';
import { PrivateUserFile } from '../../../models/privateUserFile';
import { ref, storage, addDoc, uploadBytes } from '../../../utils/firebase';

const supportedMimeTypes = ['image/png', 'image/jpeg'];

const PrivateUserFileUploadFormWidgetComponent = (props: { userId: string }) => {
  const { userId } = props;
  const [file, setFile] = React.useState<File | null>(null);

  const handleOnChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.files);
    const fileList = event.target.files;
    if (!fileList?.length) {
      alert('No file selected');
      return;
    }
    const file = fileList[0];
    const mimeType = file.type;
    if (!supportedMimeTypes.includes(mimeType)) {
      alert('Unsupported file type');
      return;
    }
    setFile(file);
  };

  const handleSubmit = async () => {
    if (!userId) {
      alert('No user id');
      return;
    }
    if (!file) {
      alert('No file selected');
      return;
    }
    const privateUserFile: Partial<PrivateUserFile> = {
      fileName: file.name,
      fileSize: file.size,
      fileMimeType: file.type,
    };
    const fileDocRef = await addDoc(privateUserFileCollection(userId), privateUserFile);
    const fileId = fileDocRef.id;
    const filePath = `/v/1/types/private/users/${userId}/files/${fileId}/${file.name}`;
    const fileRef = ref(storage, filePath);
    const uploadResult = await uploadBytes(fileRef, file);
    console.log({ uploadResult });
  };

  return (
    <>
      <input
        type="file"
        className="file-input w-full max-w-xs"
        onChange={(e) => {
          handleOnChangeFile(e);
        }}
        required
      />
      <button
        className="btn btn-primary"
        onClick={async () => {
          await handleSubmit();
        }}
      >
        Upload
      </button>
    </>
  );
};

export default PrivateUserFileUploadFormWidgetComponent;

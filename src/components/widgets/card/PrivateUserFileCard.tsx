import React, { useEffect, useState } from 'react';
import { ref, storage, addDoc, uploadBytes, getDownloadURL, setDoc } from '../../../utils/firebase';
import { PrivateUserFile } from '../../../models/privateUserFile';

const PrivateUserFileWidgetCardComponent = (props: { privateUserFile: PrivateUserFile }) => {
  const { privateUserFile } = props;
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    console.log(privateUserFile.fileFullPath);
    const fileRef = ref(storage, privateUserFile.fileFullPath);
    getDownloadURL(fileRef)
      .then((url) => {
        setDownloadUrl(url);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [privateUserFile]);

  return (
    <div className="card bg-base-100 shadow-xl">
      <figure>
        {/^image\/.*$/.test(privateUserFile.fileMimeType) && downloadUrl ? (
          <img className="max-w-md h-auto" src={downloadUrl} alt={privateUserFile.fileName} />
        ) : null}
      </figure>
      <div className="card-body">
        <div className="card-content flex justify-center">
          <div className="stats max-w-md">
            <div className="stat">
              <div className="stat-title">File ID</div>
              <div className="stat-value">{privateUserFile.fileId}</div>
              <div className="stat-desc"></div>
            </div>
          </div>
        </div>
        <div className="card-content flex justify-center">
          <div className="stats max-w-md">
            <div className="stat">
              <div className="stat-title">File Name</div>
              <div className="stat-value">{privateUserFile.fileName}</div>
              <div className="stat-desc"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateUserFileWidgetCardComponent;

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faKey } from '@fortawesome/free-solid-svg-icons';
import { PrivateUser } from '../../../models/privateUser';
import DefaultProfileImage from '../../../images/default-profile-image.png';
import { functions, httpsCallable } from '../../../utils/firebase';
import {
  HttpsOnCallBackupRecoveryKeyFileRequest,
  HttpsOnCallBackupRecoveryKeyFileResponse,
} from '../../../models/httpsOnCallBackupRecoveryKeyFile';

const v1HttpsOnCallBackupRecoveryKeyFile = httpsCallable<
  HttpsOnCallBackupRecoveryKeyFileRequest,
  HttpsOnCallBackupRecoveryKeyFileResponse
>(functions, 'v1-https-onCall-backupRecoveryKeyFile');

const PrivateUserCardWidgetComponent = (privateUser: PrivateUser) => {
  const {
    userId,
    userDisplayName,
    userPhotoUrl,
    userMultisigAccountAddressString,
    userAccountPrepared,
    userCreatedAt,
    userUpdatedAt,
  } = privateUser;

  const handleClickCopy = async (copiedString: string) => {
    await navigator.clipboard.writeText(copiedString);
  };

  const handleClickBackupYourRecoveryKeyFile = async (userId: string) => {
    const backupRecoveryKeyFileResponse = (await v1HttpsOnCallBackupRecoveryKeyFile({ userId })).data;
    const backupRecoveryKeyFileJsonString = JSON.stringify(backupRecoveryKeyFileResponse, null, 2);
    const blob = new Blob([backupRecoveryKeyFileJsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const dummyElement = document.createElement('a');
    dummyElement.href = url;
    dummyElement.setAttribute('download', 'BackupRecoveryKeyFile.txt');
    dummyElement.click();
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <figure>
        {userPhotoUrl ? (
          <img className="max-w-md h-auto" src={userPhotoUrl} alt="User Profile Image" />
        ) : (
          <img className="max-w-md h-auto" src={DefaultProfileImage} alt="Default Profile Image" />
        )}
      </figure>
      <div className="card-body">
        <h2 className="card-title justify-center">User</h2>
        <div className="card-content flex justify-center">
          <div className="stats max-w-md">
            <div className="stat">
              <div className="stat-title">User ID</div>
              <div className="stat-value">{userId}</div>
              <div className="stat-desc">This was engraved to the Symbol blockchain</div>
            </div>
          </div>
        </div>
        <div className="card-content flex justify-center">
          <div className="stats max-w-md">
            <div className="stat">
              <div className="stat-title">Status</div>
              <div className="stat-value">
                {userAccountPrepared ? (
                  <span className="bg-success">READY</span>
                ) : (
                  <span className="bg-error">NOT READY</span>
                )}
              </div>
              <div className="stat-desc">Status of account set up</div>
            </div>
            <div className="stat">
              <div className="stat-title">Name</div>
              <div className="stat-value">{userDisplayName}</div>
              <div className="stat-desc"></div>
            </div>
          </div>
        </div>
        <div className="card-content flex justify-center">
          <div className="stats max-w-md">
            <div className="stat">
              <div className="stat-title">
                Multisig Account Address
                <div className="tooltip tooltip-right" data-tip="Copy">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={async () => {
                      await handleClickCopy(userMultisigAccountAddressString);
                    }}
                  >
                    <FontAwesomeIcon icon={faCopy}></FontAwesomeIcon>
                  </button>
                </div>
              </div>
              <div className="stat-value">
                <a
                  className="link link-primary"
                  href={`${process.env.REACT_APP_SYMBOL_BLOCK_EXPLORER_URL}/accounts/${userMultisigAccountAddressString}`}
                >
                  {userMultisigAccountAddressString}
                </a>
              </div>
              <div className="stat-desc">
                You can encrypt file data with this account private key and engrave it on the blockchain
              </div>
            </div>
          </div>
        </div>
        <div className="card-content flex justify-center">
          <div className="stats max-w-md">
            <div className="stat">
              <div className="stat-title">Year</div>
              <div className="stat-value">{userCreatedAt.getFullYear()}</div>
              <div className="stat-desc">Created at</div>
            </div>
            <div className="stat">
              <div className="stat-title">Month</div>
              <div className="stat-value">{userCreatedAt.getMonth()}</div>
              <div className="stat-desc">Created at</div>
            </div>
            <div className="stat">
              <div className="stat-title">Day</div>
              <div className="stat-value">{userCreatedAt.getDate()}</div>
              <div className="stat-desc">Created at</div>
            </div>
            <div className="stat">
              <div className="stat-title">Hours</div>
              <div className="stat-value">{userCreatedAt.getHours()}</div>
              <div className="stat-desc">Created at</div>
            </div>
            <div className="stat">
              <div className="stat-title">Minutes</div>
              <div className="stat-value">{userCreatedAt.getMinutes()}</div>
              <div className="stat-desc">Created at</div>
            </div>
            <div className="stat">
              <div className="stat-title">Seconds</div>
              <div className="stat-value">{userCreatedAt.getSeconds()}</div>
              <div className="stat-desc">Created at</div>
            </div>
          </div>
        </div>
        <div className="card-content flex justify-center">
          <div className="stats max-w-md">
            <div className="stat">
              <div className="stat-title">Year</div>
              <div className="stat-value">{userUpdatedAt.getFullYear()}</div>
              <div className="stat-desc">Updated at</div>
            </div>
            <div className="stat">
              <div className="stat-title">Month</div>
              <div className="stat-value">{userUpdatedAt.getMonth()}</div>
              <div className="stat-desc">Updated at</div>
            </div>
            <div className="stat">
              <div className="stat-title">Day</div>
              <div className="stat-value">{userUpdatedAt.getDate()}</div>
              <div className="stat-desc">Updated at</div>
            </div>
            <div className="stat">
              <div className="stat-title">Hours</div>
              <div className="stat-value">{userUpdatedAt.getHours()}</div>
              <div className="stat-desc">Updated at</div>
            </div>
            <div className="stat">
              <div className="stat-title">Minutes</div>
              <div className="stat-value">{userUpdatedAt.getMinutes()}</div>
              <div className="stat-desc">Updated at</div>
            </div>
            <div className="stat">
              <div className="stat-title">Seconds</div>
              <div className="stat-value">{userUpdatedAt.getSeconds()}</div>
              <div className="stat-desc">Updated at</div>
            </div>
          </div>
        </div>
        <div className="card-actions justify-center">
          <button
            className="btn btn-primary"
            onClick={async () => {
              await handleClickBackupYourRecoveryKeyFile(userId);
            }}
          >
            <FontAwesomeIcon icon={faKey} className="mr-2" />
            Backup your recovery key file
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivateUserCardWidgetComponent;

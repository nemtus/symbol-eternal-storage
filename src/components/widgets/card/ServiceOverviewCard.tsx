import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faFileCirclePlus } from '@fortawesome/free-solid-svg-icons';
import XymCityCityspaceImage from '../../../images/xym-city-cityscape-light.png';
import { AuthUser } from '../../../utils/firebase';

const ServiceOverviewCardWidgetComponent = (props: { authUser: AuthUser | null }) => {
  const { authUser } = props;

  return (
    <div className="card bg-base-100 shadow-xl">
      <figure>
        <img className="max-w-md h-auto" src={XymCityCityspaceImage} alt="XYM City Cityscape Image" />
      </figure>
      <div className="card-body">
        <h2 className="card-title justify-center">Your Files Forever...</h2>
        <p className="card-content flex justify-center">
          {"Let's engrave your files on the Symbol blockchain forever!"}
        </p>
        {authUser ? (
          <div className="card-actions justify-center">
            <a className="btn btn-accent" href={`/users/${authUser.uid}/files`}>
              <FontAwesomeIcon icon={faFile} className="mr-2" />
              View your files
            </a>
            <a className="btn btn-accent" href={`/users/${authUser.uid}/files/create`}>
              <FontAwesomeIcon icon={faFileCirclePlus} className="mr-2" />
              Engrave your file
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ServiceOverviewCardWidgetComponent;

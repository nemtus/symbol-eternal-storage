import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBars, faFile, faUserGear, faUser, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useAuthUserContext } from '../../../contexts/auth';

const AppHeaderWidgetComponent = () => {
  const { authUser, signOut } = useAuthUserContext();

  const handleSignOut = async (): Promise<void> => {
    await signOut();
  };

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost btn-">
            <FontAwesomeIcon icon={faBars} />
          </label>
          <ul tabIndex={0} className="menu dropdown-content shadow bg-base-100 rounded-box w-52">
            <li>
              <a href="/">
                <FontAwesomeIcon icon={faHome} />
                Home
              </a>
            </li>
            {authUser ? (
              <li>
                <a href={`/users/${authUser.uid}/files`}>
                  <FontAwesomeIcon icon={faFile} />
                  Files
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="navbar-center">
        <a className="btn btn-ghost normal-case text-xl" href="/">
          Symbol Eternal Storage
        </a>
      </div>
      <div className="navbar-end">
        <div className="dropdown flex justify-end">
          {authUser ? (
            <>
              <label tabIndex={0} className="btn btn-ghost btn-circle">
                <FontAwesomeIcon icon={faUser} />
              </label>
              <ul tabIndex={0} className="menu dropdown-content shadow bg-base-100 rounded-box w-52">
                <li>
                  <a href={`/users/${authUser.uid}`}>
                    <FontAwesomeIcon icon={faUserGear} />
                    User settings
                  </a>
                </li>
                <div className="divider"></div>
                <li>
                  <button onClick={handleSignOut}>
                    <FontAwesomeIcon icon={faArrowRightFromBracket} />
                    Sign out
                  </button>
                </li>
              </ul>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AppHeaderWidgetComponent;

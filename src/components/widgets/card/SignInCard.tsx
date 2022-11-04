import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import SymbolFlagImage from '../../../images/symbol-flag-light.png';

const SignInCardWidgetComponent = (props: { signInWithGoogle: () => Promise<void> }) => {
  const { signInWithGoogle } = props;

  return (
    <div className="card bg-base-100 shadow-xl">
      <figure>
        <img className="max-w-md h-auto" src={SymbolFlagImage} alt="Symbol Flag Image" />
      </figure>
      <div className="card-body">
        <h2 className="card-title justify-center">Sign in</h2>
        <p className="card-content flex justify-center">
          You need to sign in to engrave your files to Symbol blockchain forever!
        </p>
        <div className="card-actions justify-center">
          <button className="btn btn-accent" onClick={signInWithGoogle}>
            <FontAwesomeIcon icon={faGoogle} className="mr-2" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInCardWidgetComponent;

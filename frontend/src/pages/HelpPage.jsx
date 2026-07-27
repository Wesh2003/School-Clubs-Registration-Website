import Help from "../components/Help";
import UserNavBar from "../components/UserNavBar";

function HelpPage({isAuthenticated}) {
  // State to track authentication status

  return (
    <div className='HelpPage'>
        <UserNavBar isAuthenticated={isAuthenticated} />
      <Help/>      
    </div>
  );
}

export default HelpPage;
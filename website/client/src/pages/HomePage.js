import React from 'react';

import MenuBar from '../components/MenuBar';


function HomePage(props) {

  return (
    <div>
      <MenuBar/>
      <div className="text-center mt-5">
        <h1>Welcome to the NBA Database!</h1>
        <h2 className="mt-5">Click on a link to get started!</h2>
      </div>
    </div>
  )
}


export default HomePage


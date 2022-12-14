import React from 'react';
import {
    Navbar,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink
  } from "shards-react";

function MenuBar(props) {
  return(
    <Navbar type="dark" theme="primary" expand="md">
    <NavbarBrand href="/">NBA Database</NavbarBrand>
    <Nav navbar>
      <NavItem>
        <NavLink active href="/">
          Home
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink active href="/players">
          Players
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink active  href="/teams" >
          Teams
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink active href="/luck">
          Luck Rankings
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink active href="/clutch">
          Clutch Rankings
        </NavLink>
      </NavItem>
    </Nav>
  </Navbar>
  )
}

export default MenuBar

"use strict";
import ProxyMethods from '../proxy-methods/proxy-methods.pu';

export default ProxyMethods.forward('../users/users.bg.ts', ['getProfilesById']);

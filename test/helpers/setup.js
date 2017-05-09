/**
 * setup
 *
 * Sets up the test dependencies for unit tests. You
 * won't ordinarily need to edit this file.
 */

/* Node modules */

/* Third-party modules */
const chai = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

/* Files */

chai.use(sinonChai);

const expect = chai.expect;

proxyquire.noCallThru();

module.exports = {
  expect,
  proxyquire,
  sinon,
};

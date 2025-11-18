const mongoose = require('mongoose');
const UserWallet = require('../../../src/models/userWallet.model');

describe('UserWallet Model', () => {
  it('should have a schema', () => {
    expect(UserWallet.schema).toBeDefined();
  });

  it('should have a user field', () => {
    const user = UserWallet.schema.obj.user;
    expect(user).toBeDefined();
    expect(user.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(user.ref).toBe('User');
    expect(user.required).toBe(true);
  });

  it('should have an nftItems field', () => {
    const nftItems = UserWallet.schema.obj.nftItems;
    expect(nftItems).toBeDefined();
    expect(Array.isArray(nftItems)).toBe(true);
    expect(nftItems[0].transactionHash.type).toBe(String);
    expect(nftItems[0].transactionHash.required).toBe(true);
    expect(nftItems[0].transactionHash.trim).toBe(true);
    expect(nftItems[0].transactionHash.unique).toBe(true);
    expect(nftItems[0].filename.type).toBe(String);
    expect(nftItems[0].filename.required).toBe(true);
    expect(nftItems[0].filename.trim).toBe(true);
    expect(nftItems[0].amount.type).toBe(Number);
    expect(nftItems[0].amount.required).toBe(true);
    expect(nftItems[0].amount.default).toBe(1);
    expect(nftItems[0].tokenId.type).toBe(String);
    expect(nftItems[0].tokenId.required).toBe(true);
    expect(nftItems[0].tokenId.trim).toBe(true);
    expect(nftItems[0].tokenURI.type).toBe(String);
    expect(nftItems[0].tokenURI.required).toBe(true);
    expect(nftItems[0].tokenURI.trim).toBe(true);
    expect(nftItems[0].contractAddress.type).toBe(String);
    expect(nftItems[0].contractAddress.required).toBe(true);
    expect(nftItems[0].contractAddress.trim).toBe(true);
    expect(nftItems[0].mintedAt.type).toBe(Date);
    expect(nftItems[0].mintedAt.default).toBeDefined();
  });

  it('should have a createdAt field', () => {
    const createdAt = UserWallet.schema.obj.createdAt;
    expect(createdAt).toBeDefined();
    expect(createdAt.type).toBe(Date);
    expect(createdAt.default).toBeDefined();
  });

  it('should have timestamps', () => {
    const timestamps = UserWallet.schema.options.timestamps;
    expect(timestamps).toBe(true);
  });

  it('should have toJSON and paginate plugins', () => {
    const plugins = UserWallet.schema.plugins.map((plugin) => plugin.fn.name);
    expect(plugins).toContain('toJSON');
    expect(plugins).toContain('paginate');
  });
});

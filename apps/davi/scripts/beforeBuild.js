const fs = require('fs');
const path = require('path');

if (!fs.existsSync(path.resolve(__dirname, '../src/configs/localhost'))) {
  fs.mkdirSync(path.resolve(__dirname, '../src/configs/localhost'));
}

fs.writeFileSync(
  path.resolve(__dirname, '../src/configs/localhost/config.json'),
  JSON.stringify(
    {
      contracts: {
        utils: {
          guildRegistry: '0xc2dd7F6caA0f23F7e30F3cae1206da253373A923',
        },
        votingMachines: {},
      },
    },
    null,
    2
  )
);

fs.writeFileSync(
  path.resolve(__dirname, '../src/bytecodes/local.json'),
  JSON.stringify(
    [
      {
        type: 'ERC20Guild',
        bytecodeHash:
          '0x946cda015525e920957e6d1f72d350ba9cdadf2461dacb479cf13d8ccc8f47c5',
        deployedBytecodeHash:
          '0x73b3bbf79394482b90246b47a2b2968521c3f4e01230fb2ae4a33ca9975c9166',
        features: [],
      },
      {
        type: 'SnapshotRepERC20Guild',
        bytecodeHash:
          '0x345f0ee269c46278f442db8cfdf18954092025caa8b7d30196b00469727dc066',
        deployedBytecodeHash:
          '0x3e69834ec324d588d1e334dc8660bf3d10b070c3e7a7b5364f79c03b5ee1e1ff',
        features: ['REP', 'SNAPSHOT'],
      },
      {
        type: 'SnapshotERC20Guild',
        bytecodeHash:
          '0x81681150afcdabc59e66998de1dbf6eb392c50e902a3ae0e4ec79191618eb36b',
        deployedBytecodeHash:
          '0xb79ad1521611a2035347a8e1bfdee11bb52eab831f4070dec76730e69674d36a',
        features: ['SNAPSHOT'],
      },
      {
        type: 'DXDGuild',
        bytecodeHash:
          '0x7f341343b9c604c60837d3687fec3232d2a1955d69dd4e3794db77fa326c60dc',
        deployedBytecodeHash:
          '0xa68a425e0b36d3be6b0305f8a5e596ca8b4446ea9fff5bddb906b36ecb3d7797',
        features: [],
      },
    ],
    null,
    2
  )
);

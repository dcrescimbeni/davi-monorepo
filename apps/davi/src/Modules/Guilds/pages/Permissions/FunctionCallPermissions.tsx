import { useMemo, useState } from 'react';
import { BiInfinite } from 'react-icons/bi';
import { useTranslation } from 'react-i18next';
import { useNetwork } from 'wagmi';

import { getNetworkById, MAINNET_ID, shortenAddress } from 'utils';
import { FetcherHooksInterface } from 'stores/types';
import { Loading } from 'components/primitives/Loading';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ToggleContainer,
  ToggleLabel,
} from './Permissions.styled';
import useENSAvatar from 'hooks/Guilds/ens/useENSAvatar';
import { useDecodedCall } from 'hooks/Guilds/contracts/useDecodedCall';
import { Call } from 'components/ActionsBuilder/types';
import { Box } from 'components/primitives/Layout';
import { Toggle } from 'components/primitives/Forms/Toggle';

interface IFunctionCallPermissions {
  functionCallPermissions: ReturnType<
    FetcherHooksInterface['useGetAllPermissions']
  >;
}

interface IFunctionCallRow {
  functionCall: IFunctionCallPermissions['functionCallPermissions']['data'][0];
  showAdvancedView: boolean;
}

const FunctionCallPermissionRow = ({
  functionCall,
  showAdvancedView,
}: IFunctionCallRow) => {
  const { chain } = useNetwork();

  const nativeAsssetDecimals = getNetworkById(chain?.id).nativeAsset.decimals;

  const formattedValueAllowed = useBigNumberToNumber(
    functionCall?.valueAllowed,
    nativeAsssetDecimals,
    3
  );

  const functionCallValueAllowed = useMemo(() => {
    return functionCall?.valueAllowed?.toString() === '0' ? (
      <BiInfinite size={20} />
    ) : (
      formattedValueAllowed
    );
  }, [formattedValueAllowed, functionCall?.valueAllowed]);

  const { ensName } = useENSAvatar(functionCall.to, MAINNET_ID);

  const dataForDecodedCall: Call = {
    from: functionCall.from,
    to: functionCall.to,
    value: functionCall.valueAllowed,
    data: functionCall.functionSignature,
  };

  const { decodedCall } = useDecodedCall(dataForDecodedCall);

  const functionNameDisplay = useMemo(() => {
    if (!decodedCall || !decodedCall.function) {
      return functionCall.functionSignature;
    } else {
      const functionName = decodedCall.function.name;
      const functionSignature = functionCall.functionSignature;
      const functionArgs = decodedCall?.function?.inputs?.reduce(
        (inputString, currentInput, index) => {
          if (index === 0) return currentInput.type;
          return `${inputString},${currentInput.type}`;
        },
        ''
      );

      if (showAdvancedView) {
        return (
          <>
            <Box> {functionName}</Box>
            <Box margin={'5px 0'}>({functionArgs})</Box>
            <Box>{functionSignature}</Box>
          </>
        );
      } else {
        return functionName;
      }
    }
  }, [decodedCall, functionCall?.functionSignature, showAdvancedView]);

  return (
    <TableRow>
      <TableCell width={'34%'} alignment="left">
        {ensName || shortenAddress(functionCall?.to)}
      </TableCell>
      <TableCell width={'33%'} alignment="left">
        {functionNameDisplay}
      </TableCell>
      <TableCell width={'33%'} alignment="right">
        {functionCallValueAllowed}
      </TableCell>
    </TableRow>
  );
};

const FunctionCallPermissions = ({
  functionCallPermissions,
}: IFunctionCallPermissions) => {
  const { t } = useTranslation();
  const [showAdvancedView, setShowAdvancedView] = useState(false);

  return (
    <>
      <Table>
        <TableHead>
          <tr>
            <TableHeader alignment={'left'}>{t('contract')}</TableHeader>
            <TableHeader alignment={'left'}>{t('function')}</TableHeader>
            <TableHeader alignment={'right'}>{t('allowedAmount')}</TableHeader>
          </tr>
        </TableHead>
        <tbody>
          {functionCallPermissions ? (
            functionCallPermissions?.data?.map(functionCall => {
              return (
                <FunctionCallPermissionRow
                  functionCall={functionCall}
                  showAdvancedView={showAdvancedView}
                  key={functionCall?.id}
                />
              );
            })
          ) : (
            <TableRow>
              <TableCell alignment={'left'}>
                <Loading loading text />
              </TableCell>
              <TableCell alignment={'left'}>
                <Loading loading text />
              </TableCell>
              <TableCell alignment={'right'}>
                <Loading loading text />
              </TableCell>
            </TableRow>
          )}
        </tbody>
      </Table>
      <ToggleContainer>
        <ToggleLabel>{t('advancedView')}</ToggleLabel>
        <Toggle
          value={showAdvancedView}
          onChange={() => setShowAdvancedView(!showAdvancedView)}
          small
          name="toggle-advanced-view"
        />
      </ToggleContainer>
    </>
  );
};

export default FunctionCallPermissions;

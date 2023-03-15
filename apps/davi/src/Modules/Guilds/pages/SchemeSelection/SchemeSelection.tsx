import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNetwork } from 'wagmi';
import { useQuery } from '@apollo/client';

import { getSchemesDocument, getSchemesQuery } from '.graphclient';
import { getApolloClient } from 'clients/apollo';
import { useHookStoreProvider } from 'stores';
import { SupportedSubgraph } from 'stores/types';

import {
  SidebarCard,
  SidebarCardContent,
  SidebarCardHeaderSpaced,
} from 'components/SidebarCard';
import { Divider } from 'components/Divider';
import { Result, ResultState } from 'components/Result';
import { IconButton } from 'components/primitives/Button';
import { RadioInput } from 'components/primitives/Forms/RadioInput';
import { Box } from 'components/primitives/Layout';
import { StyledLink } from 'components/primitives/Links';
import { Loading } from 'components/primitives/Loading';
import { Heading } from 'components/primitives/Typography';
import { useTypedParams } from 'Modules/Guilds/Hooks/useTypedParams';
import { PageContainer, SidebarContent } from 'Modules/Guilds/styles';

import {
  CardContainer,
  CardTitle,
  NextButton,
  RadioInputContainer,
  StyledDivider,
} from './SchemeSelection.styled';
import { SchemeInfo } from './SchemeInfo';
import { Treasury } from '../Treasury';
import { PermissionsPage } from '../Permissions';

const SchemeSelection = () => {
  const { t } = useTranslation();
  const { chain } = useNetwork();
  const { guildId: daoId, chainName } = useTypedParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const discussionId = searchParams.get('ref');
  const subdaoId = searchParams.get('subdao');

  const {
    capabilities: { hasSubDAO },
  } = useHookStoreProvider();

  const {
    data,
    loading: isSchemeLoading,
    error: errorFetchingScheme,
  } = useQuery<getSchemesQuery>(getSchemesDocument, {
    client: getApolloClient(SupportedSubgraph.Governance1_5, chain?.id),
    variables: { id: daoId?.toLowerCase() },
  });

  const [selectedSchemeIndex, setSelectedSchemeIndex] = useState(0);

  useEffect(() => {
    try {
      data.dao.schemes.find((scheme, index) => {
        if (scheme.id === subdaoId) {
          setSelectedSchemeIndex(index);
          return true;
        } else {
          return false;
        }
      });
    } catch {
      return;
    }
  }, [data, subdaoId]);

  if (hasSubDAO === false) {
    navigate(`/${chainName}/${daoId}/create-proposal`);
    return <></>;
  }

  if (
    !data ||
    !data.dao ||
    !data.dao.schemes ||
    data.dao.schemes.length === 0
  ) {
    return <></>;
  }

  if (errorFetchingScheme) {
    return (
      <PageContainer>
        <Result
          title={t('schemes.errorFetchingSchemes')}
          subtitle={errorFetchingScheme.message}
          state={ResultState.ERROR}
        />
      </PageContainer>
    );
  }

  const schemes = data.dao.schemes;
  const selectedScheme = schemes[selectedSchemeIndex];

  return (
    <>
      <PageContainer>
        <div>
          <StyledLink to={`/${chainName}/${daoId}`} variant="outline">
            <IconButton
              data-testid="proposal-home-btn"
              variant="secondary"
              iconLeft
              padding={'0.6rem 0.8rem'}
              marginTop={'5px;'}
            >
              <FaChevronLeft style={{ marginRight: '15px' }} />
              {t('modals.cancel')}
            </IconButton>
          </StyledLink>

          <Heading size={2}>
            {selectedScheme.name} ({selectedScheme.id})
          </Heading>
          <div>
            <CardContainer>
              <CardTitle size={1}>{t('schemes.schemeParameters')}</CardTitle>
              <StyledDivider />
              {isSchemeLoading ? (
                <Loading loading text />
              ) : (
                <SchemeInfo selectedScheme={selectedScheme} />
              )}
            </CardContainer>
            <Divider />
          </div>
          <Box margin="20px 0px">
            <PermissionsPage
              subDaoAddress={
                selectedScheme.canMakeAvatarCalls ? null : selectedScheme.id
              }
            />
            <Divider />
          </Box>
          <Box>
            <Treasury
              subDaoAddress={
                selectedScheme.canMakeAvatarCalls ? null : selectedScheme.id
              }
            />
          </Box>
        </div>
        <SidebarContent>
          <SidebarCard
            header={
              <SidebarCardHeaderSpaced>
                {t('schemes.schemeForProposal')}
              </SidebarCardHeaderSpaced>
            }
          >
            <SidebarCardContent>
              {schemes.map((_, index) => {
                return (
                  <>
                    <RadioInputContainer
                      onClick={() => {
                        setSelectedSchemeIndex(index);
                      }}
                    >
                      <RadioInput
                        value={schemes[index]}
                        checked={selectedSchemeIndex === index}
                      />
                      {schemes[index].name}
                    </RadioInputContainer>
                    {index !== schemes.length - 1 && (
                      <Divider margin="14px 0px " />
                    )}
                  </>
                );
              })}
            </SidebarCardContent>
            <Divider />

            <Box margin={'24px'}>
              <StyledLink
                to={`/${chainName}/${daoId}/create-proposal?subdao=${
                  selectedScheme.id
                }${discussionId ? '&ref=' + discussionId : ''}`}
              >
                <NextButton data-testid="create-proposal-btn">
                  {t('schemes.next')}
                </NextButton>
              </StyledLink>
            </Box>
          </SidebarCard>
        </SidebarContent>
      </PageContainer>
    </>
  );
};

export default SchemeSelection;

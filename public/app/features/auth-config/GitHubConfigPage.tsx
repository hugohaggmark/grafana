import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';

import { AppEvents, NavModelItem, SelectableValue } from '@grafana/data';
import { getAppEvents, getBackendSrv, isFetchError } from '@grafana/runtime';
import { Button, Field, Input, InputControl, LinkButton, Select, Stack, Switch } from '@grafana/ui';
import { FormPrompt } from 'app/core/components/FormPrompt/FormPrompt';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';

import { StoreState } from '../../types';

import { FieldData, fieldMap, fields } from './fields';
import { loadSettings } from './state/actions';
import { SSOProvider, SSOProviderDTO } from './types';
import { dataToDTO, dtoToData } from './utils';

const appEvents = getAppEvents();
const getPageNav = (provider?: SSOProvider): NavModelItem => {
  if (!provider) {
    return {
      text: 'Authentication',
      subTitle: 'Configure authentication providers',
      icon: 'shield',
      id: 'authentication',
    };
  }

  return {
    text: provider.settings.name || '',
    subTitle: `To configure ${provider.settings.name} OAuth2 you must register your application with ${provider.settings.name}. ${provider.settings.name} will generate a Client ID and Client Secret for you to use.`,
    icon: provider.settings.icon || 'shield',
    id: provider.provider,
  };
};

type ProviderData = Pick<SSOProviderDTO, 'clientId' | 'clientSecret' | 'enabled' | 'teamIds' | 'allowedOrganizations'>;

interface RouteProps extends GrafanaRouteComponentProps<{ provider: string }> {}

function mapStateToProps(state: StoreState, props: RouteProps) {
  const { isLoading, providers } = state.authConfig;
  const { provider } = props.match.params;
  const config = providers.find((config) => config.provider === provider);
  return {
    config,
    isLoading,
    provider,
  };
}

const mapDispatchToProps = {
  loadSettings,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector>;

/**
 * Separate the Page logic from the Content logic for easier testing.
 */
export const GitHubConfigPage = ({ config, loadSettings, isLoading, provider }: Props) => {
  const pageNav = getPageNav(config);
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);
  return (
    <Page navId="authentication" pageNav={pageNav}>
      <GitHubConfig config={config} isLoading={isLoading} provider={provider} />
    </Page>
  );
};

export default connector(GitHubConfigPage);

interface GitHubConfigProps {
  config?: SSOProvider;
  isLoading?: boolean;
  provider: string;
}

export const GitHubConfig = ({ config, provider, isLoading }: GitHubConfigProps) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({ defaultValues: dataToDTO(config) });
  const [isSaving, setIsSaving] = useState(false);
  const providerFields = fields[provider];
  const onSubmit = async (data: SSOProviderDTO) => {
    setIsSaving(true);
    const requestData = dtoToData<ProviderData>(data);
    try {
      await getBackendSrv().put(`/api/v1/sso-settings/${provider}`, requestData);
      appEvents.publish({
        type: AppEvents.alertSuccess.name,
        payload: ['Settings saved'],
      });
    } catch (error) {
      let message = '';
      if (isFetchError(error)) {
        message = error.data.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      appEvents.publish({
        type: AppEvents.alertError.name,
        payload: [message],
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (name: keyof SSOProvider['settings'], fieldData: FieldData) => {
    switch (fieldData.type) {
      case 'text':
        return (
          <Field
            label={fieldData.label}
            required={!!fieldData.validation?.required}
            invalid={!!errors[name]}
            error={fieldData.validation?.message}
            key={name}
          >
            <Input {...register(name, { required: !!fieldData.validation?.required })} type="text" id={name} />
          </Field>
        );
      case 'select':
        const options = watch(name) as SelectableValue[];
        return (
          <Field label={fieldData.label} htmlFor={name} key={name}>
            <InputControl
              name={name}
              control={control}
              render={({ field: { ref, onChange, ...fieldProps } }) => {
                return (
                  <Select
                    {...fieldProps}
                    placeholder={fieldData.placeholder}
                    isMulti={fieldData.multi}
                    inputId={name}
                    options={options}
                    allowCustomValue
                    onChange={onChange}
                    onCreateOption={(v) => {
                      const customValue = { value: v, label: v };
                      onChange([...options, customValue]);
                    }}
                  />
                );
              }}
            />
          </Field>
        );
      default:
        throw new Error(`Unknown field type: ${fieldData.type}`);
    }
  };

  return (
    <Page.Contents isLoading={isLoading}>
      <Stack grow={1} direction={'column'}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '600px' }}>
          <>
            <FormPrompt
              confirmRedirect={isDirty}
              onDiscard={() => {
                reset();
              }}
            />
            <Field label="Enabled">
              <Switch {...register('enabled')} id="enabled" label={'Enabled'} />
            </Field>
            {providerFields.map((fieldName) => {
              const field = fieldMap[fieldName];
              return renderField(fieldName, field);
            })}
            <Stack gap={2}>
              <Field>
                <Button type={'submit'}>{isSaving ? 'Saving...' : 'Save'}</Button>
              </Field>
              <Field>
                <LinkButton href={'/admin/authentication'} variant={'secondary'}>
                  Discard
                </LinkButton>
              </Field>
            </Stack>
          </>
        </form>
      </Stack>
    </Page.Contents>
  );
};

import React, { FC, ReactNode, useCallback, useEffect, useState, useRef } from 'react';
import { css, cx } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { Counter, Icon, useStyles2 } from '@grafana/ui';
import { PANEL_EDITOR_UI_STATE_STORAGE_KEY } from './state/reducers';
import { useLocalStorage } from 'react-use';
import { selectors } from '@grafana/e2e-selectors';
import { getLocationSrv } from '@grafana/runtime';
import { categoryParam } from './OptionsPaneOptions';
import { useQueryParams } from 'app/core/hooks/useQueryParams';
export interface OptionsPaneCategoryProps {
  id: string;
  title?: string;
  renderTitle?: (isExpanded: boolean) => React.ReactNode;
  isOpenDefault?: boolean;
  itemsCount?: number;
  forceOpen?: number;
  className?: string;
  isNested?: boolean;
  children: ReactNode;
}

export const OptionsPaneCategory: FC<OptionsPaneCategoryProps> = React.memo(
  ({ id, title, children, forceOpen, isOpenDefault, renderTitle, className, itemsCount, isNested = false }) => {
    const initialIsExpanded = isOpenDefault !== false;
    const [savedState, setSavedState] = useLocalStorage(getOptionGroupStorageKey(id), {
      isExpanded: initialIsExpanded,
    });

    const isSelected = useQueryParams()[0][categoryParam] === id;
    // `savedState` can be undefined by typescript, so we have to handle that case
    const [isExpanded, setIsExpanded] = useState(savedState?.isExpanded ?? initialIsExpanded);
    const styles = useStyles2(getStyles);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if ((!isExpanded && forceOpen && forceOpen > 0) || isSelected) {
        setIsExpanded(true);
        ref.current?.scrollIntoView();
      }
    }, [forceOpen, isExpanded, isSelected]);

    const onToggle = useCallback(() => {
      // TODO: set the route, listening to changes in the url, make sure the element is visible
      getLocationSrv().update({
        query: {
          [categoryParam]: isExpanded ? undefined : id,
        },
        partial: true,
      });
      setSavedState({ isExpanded: !isExpanded });
      setIsExpanded(!isExpanded);
    }, [setSavedState, setIsExpanded, isExpanded, id]);

    if (!renderTitle) {
      renderTitle = function defaultTitle(isExpanded: boolean) {
        if (isExpanded || itemsCount === undefined || itemsCount === 0) {
          return title;
        }

        return (
          <span>
            {title} <Counter value={itemsCount} />
          </span>
        );
      };
    }

    const boxStyles = cx(
      {
        [styles.box]: true,
        [styles.boxNestedExpanded]: isNested && isExpanded,
      },
      className,
      'options-group'
    );

    const headerStyles = cx(styles.header, {
      [styles.headerExpanded]: isExpanded,
      [styles.headerNested]: isNested,
    });

    const bodyStyles = cx(styles.body, {
      [styles.bodyNested]: isNested,
    });

    return (
      <div
        className={boxStyles}
        data-testid="options-category"
        aria-label={selectors.components.OptionsGroup.group(id)}
        data-optioncategory={id}
        ref={ref}
      >
        <div className={headerStyles} onClick={onToggle} aria-label={selectors.components.OptionsGroup.toggle(id)}>
          <div className={cx(styles.toggle, 'editor-options-group-toggle')}>
            <Icon name={isExpanded ? 'angle-down' : 'angle-right'} />
          </div>
          <h6 className={styles.title}>{renderTitle(isExpanded)}</h6>
        </div>
        {isExpanded && <div className={bodyStyles}>{children}</div>}
      </div>
    );
  }
);

const getStyles = (theme: GrafanaTheme2) => {
  return {
    box: css`
      border-top: 1px solid ${theme.colors.border.weak};
    `,
    boxNestedExpanded: css`
      margin-bottom: ${theme.spacing(2)};
    `,
    toggle: css`
      color: ${theme.colors.text.secondary};
      margin-right: ${theme.spacing(1)};
    `,
    title: css`
      flex-grow: 1;
      overflow: hidden;
      line-height: 1.5;
      font-size: 1rem;
      font-weight: ${theme.typography.fontWeightMedium};
      margin: 0;
    `,
    header: css`
      display: flex;
      cursor: pointer;
      align-items: baseline;
      padding: ${theme.spacing(1)};
      color: ${theme.colors.text.primary};
      font-weight: ${theme.typography.fontWeightMedium};

      &:hover {
        background: ${theme.colors.emphasize(theme.colors.background.primary, 0.03)};
      }
    `,
    headerExpanded: css`
      color: ${theme.colors.text.primary};
    `,
    headerNested: css`
      padding: ${theme.spacing(0.5, 0, 0.5, 0)};
    `,
    body: css`
      padding: ${theme.spacing(1, 2, 1, 4)};
    `,
    bodyNested: css`
      position: relative;
      padding-right: 0;
      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 8px;
        width: 1px;
        height: 100%;
        background: ${theme.colors.border.weak};
      }
    `,
  };
};

const getOptionGroupStorageKey = (id: string): string => `${PANEL_EDITOR_UI_STATE_STORAGE_KEY}.optionGroup[${id}]`;

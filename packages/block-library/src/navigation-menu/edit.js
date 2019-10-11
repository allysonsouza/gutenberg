/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	Fragment,
	useMemo,
} from '@wordpress/element';
import {
	InnerBlocks,
	InspectorControls,
	BlockControls,
	withColors,
} from '@wordpress/block-editor';
import { withSelect } from '@wordpress/data';
import {
	CheckboxControl,
	PanelBody,
	Spinner,
	Toolbar,
} from '@wordpress/components';
import { compose } from '@wordpress/compose';

import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import useBlockNavigator from './use-block-navigator';
import BlockColorsStyleSelector from './block-colors-selector';

function NavigationMenu( {
	attributes,
	setAttributes,
	clientId,
	pages,
	isRequesting,
	backgroundColor,
	textColor,
	setBackgroundColor,
	setTextColor,
} ) {
	const { navigatorToolbarButton, navigatorModal } = useBlockNavigator( clientId );
	const defaultMenuItems = useMemo(
		() => {
			if ( ! pages ) {
				return null;
			}
			return pages.map( ( page ) => {
				return [ 'core/navigation-menu-item', { label: page.title.rendered,  destination: page.permalink_template } ];
			} );
		},
		[ pages ]
	);

	const colorsSelectorProps = {
		backgroundColor,
		textColor,
		setBackgroundColor,
		setTextColor,
	};

	const navigationMenuStyles = {};
	if ( textColor.color ) {
		navigationMenuStyles[ '--color-menu-link' ] = textColor.color;
	}

	if ( backgroundColor.color ) {
		navigationMenuStyles[ '--background-color-menu-link' ] = backgroundColor.color;
	}

	const navigationMenuClasses = classnames(
		'wp-block-navigation-menu', {
			'has-text-color': textColor.color,
			'has-background-color': backgroundColor.color,
			[ textColor.class ]: textColor.color ? textColor.class : false,
			[ backgroundColor.class ]: backgroundColor.color ? backgroundColor.class : false,
		}
	);

	return (
		<Fragment>
			<BlockControls>
				<Toolbar>
					{ navigatorToolbarButton }
				</Toolbar>
				<BlockColorsStyleSelector
					style={ navigationMenuStyles }
					className={ navigationMenuClasses }
					{ ...colorsSelectorProps }
				/>
			</BlockControls>
			{ navigatorModal }
			<InspectorControls>
				<PanelBody
					title={ __( 'Menu Settings' ) }
				>
					<CheckboxControl
						value={ attributes.automaticallyAdd }
						onChange={ ( automaticallyAdd ) => {
							setAttributes( { automaticallyAdd } );
						} }
						label={ __( 'Automatically add new pages' ) }
						help={ __( 'Automatically add new top level pages to this menu.' ) }
  					/>
				</PanelBody>
			</InspectorControls>
			<div className={ navigationMenuClasses } style={ navigationMenuStyles}>
				{ isRequesting &&
					<Spinner />
				}
				{ pages &&
					<InnerBlocks
						template={ defaultMenuItems ? defaultMenuItems : null }
						allowedBlocks={ [ 'core/navigation-menu-item' ] }
					/>
				}
			</div>
		</Fragment>
	);
}

export default compose( [
	withColors( { backgroundColor: 'background-color', textColor: 'color' } ),
	withSelect( ( select ) => {
		const { getEntityRecords } = select( 'core' );
		const { isResolving } = select( 'core/data' );
		const filterDefaultPages = {
			parent: 0,
			order: 'asc',
			orderby: 'id',
		};
		return {
			pages: getEntityRecords( 'postType', 'page', filterDefaultPages ),
			isRequesting: isResolving( 'core', 'getEntityRecords', [ 'postType', 'page', filterDefaultPages ] ),
		};
	} ),
] )( NavigationMenu );




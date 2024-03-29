jQuery( function( $ ) {

	$( '.wcpdf-extensions .more' ).hide();

	$( '.wcpdf-extensions > li' ).on( 'click', function( event ) {
		$( this ).toggleClass( 'expanded' );
		$( this ).find( '.more' ).slideToggle();
	} );

	$( '.edit-next-number' ).on( 'click', function( event ) {
		// enable input & show save button
		$( this ).hide();
		$( this ).siblings( 'input' ).prop( 'disabled', false );
		$( this ).siblings( '.save-next-number.button' ).show();
	} );

	$( '.save-next-number' ).on( 'click', function( event ) {
		$input = $( this ).siblings( 'input' );
		$input.addClass( 'ajax-waiting' );

		let data = {
			security: $input.data( 'nonce' ),
			action:   'wpo_wcpdf_set_next_number',
			store:    $input.data( 'store' ),
			number:   $input.val(), 
		};

		xhr = $.ajax( {
			type: 'POST',
			url:  wpo_wcpdf_admin.ajaxurl,
			data: data,
			success: function( response ) {
				$input.removeClass( 'ajax-waiting' );
				$input.siblings( '.edit-next-number' ).show();
				$input.prop( 'disabled', 'disabled' );
				$input.siblings( '.save-next-number.button' ).hide();
			}
		} );
	} );

	$( "[name='wpo_wcpdf_documents_settings_invoice[display_number]']" ).on( 'change', function( event ) {
		if ( $( this ).val() == 'order_number' ) {
			$( this ).closest( 'td' ).find( '.description' ).slideDown();
		} else {
			$( this ).closest( 'td' ).find( '.description' ).hide();
		}
	} ).trigger( 'change' );

	// enable settings document switch
	$( '.wcpdf_document_settings_sections > h2' ).on( 'click', function() {
		$( this ).parent().find( 'ul' ).toggleClass( 'active' );
	} );


	//----------> Preview <----------//

	// objects
	let $previewWrapper           = $( '#wpo-wcpdf-preview-wrapper' );
	let $preview                  = $( '#wpo-wcpdf-preview-wrapper .preview' );
	let $previewOrderIdInput      = $( '#wpo-wcpdf-preview-wrapper input[name="order_id"]' );
	let $previewDocumentTypeInput = $( '#wpo-wcpdf-preview-wrapper input[name="document_type"]' );
	let $previewNonceInput        = $( '#wpo-wcpdf-preview-wrapper input[name="nonce"]' );
	let $previewSettingsForm      = $( '#wpo-wcpdf-settings' );
	let previewXhr                = null;

	// variables
	let previewOrderId, previewDocumentType, previewNonce, previewSettingsFormData, previewTimeout, previewSearchTimeout, previousWindowWidth;

	function loadPreviewData() {
		previewOrderId          = $previewOrderIdInput.val();
		previewDocumentType     = $previewDocumentTypeInput.val();
		previewNonce            = $previewNonceInput.val();
		previewSettingsFormData = $previewSettingsForm.serialize();
	}

	function resetDocumentType() {
		$previewDocumentTypeInput.val( $previewDocumentTypeInput.data( 'default' ) ).trigger( 'change' );
	}

	function resetOrderId() {
		$previewOrderIdInput.val( '' ).trigger( 'change' );
	}

	$( document ).ready( function() {
		resetDocumentType();      // force document type reset
		resetOrderId();           // force order ID reset
		loadPreviewData();        // load preview data

		previousWindowWidth = $(window).width();
		determinePreviewStates(); // determine preview states based on screen size
	} );

	$( window ).on( 'resize', determinePreviewStates );
		
	function determinePreviewStates() {

		// console.log(previousWindowWidth);
		// console.log('Now: ' + $(this).width() );

		// Check if preview states are allowed to change based on screen size
		if ( $previewWrapper.attr( 'data-preview-states-lock') == false ) {

			// On small screens: 2 preview states and close preview
			if ( $(this).width() <= 1200 && ( previousWindowWidth > 1200 || $(this).width() == previousWindowWidth ) ) {
				// console.log('Slide!');
				if ( $previewWrapper.attr( 'data-preview-state') == 'full' ) {
					$previewWrapper.find( '.preview-document' ).show();
					$previewWrapper.find( '.sidebar' ).hide();
					$previewWrapper.find( '.slide-left' ).hide();
					$previewWrapper.find( '.slide-right' ).show();
					$previewWrapper.attr( 'data-preview-states', 2 );
					$previewWrapper.attr( 'data-preview-state', 'full' );
					$previewWrapper.attr( 'data-from-preview-state', '' );
				} else {
					$previewWrapper.find( '.preview-document' ).hide();
					$previewWrapper.find( '.sidebar' ).show();
					$previewWrapper.find( '.slide-left' ).show();
					$previewWrapper.find( '.slide-right' ).hide();
					$previewWrapper.attr( 'data-preview-states', 2 );
					$previewWrapper.attr( 'data-preview-state', 'closed' );
					$previewWrapper.attr( 'data-from-preview-state', '' );
				}

			// On larger screens: 3 preview states and show settings as sidebar
			} else if ( $(this).width() > 1200 && ( previousWindowWidth <= 1200 || $(this).width() == previousWindowWidth ) ) {
				if ( $previewWrapper.attr( 'data-preview-state') == 'full' ) {
					$previewWrapper.find( '.preview-document' ).show();
					$previewWrapper.find( '.sidebar' ).hide();
					$previewWrapper.find( '.slide-left' ).hide();
					$previewWrapper.find( '.slide-right' ).show();
					$previewWrapper.attr( 'data-preview-states', 3 );
					$previewWrapper.attr( 'data-preview-state', 'full' );
					$previewWrapper.attr( 'data-from-preview-state', 'sidebar' );
					$previewWrapper.addClass( 'static' );
				} else if ( $previewWrapper.attr( 'data-preview-state') == 'closed' && $(this).width() !== previousWindowWidth ) {
					$previewWrapper.find( '.preview-document' ).hide();
					$previewWrapper.find( '.sidebar' ).show();
					$previewWrapper.find( '.slide-left' ).show();
					$previewWrapper.find( '.slide-right' ).hide();
					$previewWrapper.attr( 'data-preview-states', 3 );
					$previewWrapper.attr( 'data-preview-state', 'closed' );
					$previewWrapper.attr( 'data-from-preview-state', '' );
					$previewWrapper.removeClass( 'static' );
				} else {
					$previewWrapper.find( '.preview-document, .sidebar' ).show();
					$previewWrapper.find( '.slide-left, .slide-right' ).show();
					$previewWrapper.attr( 'data-preview-states', 3 );
					$previewWrapper.attr( 'data-preview-state', 'sidebar' );
					$previewWrapper.attr( 'data-from-preview-state', '' );
					$previewWrapper.removeClass( 'static' );
				}
			}
		}
		previousWindowWidth = $(this).width(); 
	}
	
	$( '.slide-left' ).on( 'click', function() {
		let previewStates = $previewWrapper.attr( 'data-preview-states' );
		let previewState  = $previewWrapper.attr( 'data-preview-state' );

		$previewWrapper.find( '.preview-data-wrapper ul' ).removeClass( 'active' );

		if ( previewStates == 3 ) {
			if ( previewState == 'closed' ) {
				$previewWrapper.find( '.preview-document' ).show();
				$previewWrapper.find( '.slide-right' ).show();
				$previewWrapper.attr( 'data-preview-state', 'sidebar' );
				$previewWrapper.attr( 'data-from-preview-state', 'closed' );
			} else {
				$previewWrapper.find( '.slide-left' ).hide();
				$previewWrapper.find( '.sidebar' ).delay(300).hide(0);
				$previewWrapper.attr( 'data-preview-state', 'full' );
				$previewWrapper.attr( 'data-from-preview-state', 'sidebar' );
				makePreviewScrollable( $previewWrapper );
			}
		} else {
			$previewWrapper.find( '.preview-document' ).show();
			$previewWrapper.find( '.slide-left' ).hide();
			$previewWrapper.find( '.slide-right' ).show();
			$previewWrapper.attr( 'data-preview-state', 'full' );
			$previewWrapper.attr( 'data-from-preview-state', 'closed' );
			makePreviewScrollable( $previewWrapper );
		}
	} );

	$( '.slide-right' ).on( 'click', function() {
		let previewStates = $previewWrapper.attr( 'data-preview-states' );
		let previewState  = $previewWrapper.attr( 'data-preview-state' );

		$previewWrapper.find( '.preview-data-wrapper ul' ).removeClass( 'active' );

		if ( previewStates == 3 ) {
			if ( previewState == 'full' ) {
				$previewWrapper.find( '.slide-left' ).delay(400).show(0);
				$previewWrapper.find( '.sidebar' ).show();
				$previewWrapper.attr( 'data-preview-state', 'sidebar' );
				$previewWrapper.attr( 'data-from-preview-state', 'full' );
			} else {
				$previewWrapper.find( '.preview-document' ).hide(300);
				$previewWrapper.find( '.slide-right' ).hide();
				$previewWrapper.attr( 'data-preview-state', 'closed' );
				$previewWrapper.attr( 'data-from-preview-state', 'sidebar' );
			}
		} else {
			$previewWrapper.find( '.preview-document' ).hide(300);
			$previewWrapper.find( '.slide-left' ).show();
			$previewWrapper.find( '.slide-right' ).hide();
			$previewWrapper.attr( 'data-preview-state', 'closed' );
			$previewWrapper.attr( 'data-from-preview-state', 'full' );
		}
		$previewWrapper.removeClass( 'static' );
	} );

	function makePreviewScrollable( wrapper ) {
		window.scrollTo( 0, 0 );
		let $wrapper = wrapper;
		// Make preview scrollable after panel animation is complete
		setTimeout( function() {
			$wrapper.addClass( 'static' );
		}, 300 );
	}

	$( '.preview-document .preview-data p' ).on( 'click', function() {
		let $previewData = $( this ).closest( '.preview-data' );
		$previewData.siblings( '.preview-data' ).find( 'ul' ).removeClass( 'active' );
		$previewData.find( 'ul' ).toggleClass( 'active' );
	} );

	$( '.preview-document .preview-data ul > li' ).on( 'click', function() {
		let $previewData = $( this ).closest( '.preview-data' );
		$previewData.find( 'ul' ).toggleClass( 'active' );
		if ( $( this ).hasClass( 'order-search' ) ) {
			$previewData.find( 'p.last-order' ).hide();
			$previewData.find( 'input[name="preview-order-search"]' ).addClass( 'active' );
			$previewData.find( 'p.order-search' ).show().find( '.order-search-label' ).text( $( this ).text() );
		} else {
			$previewData.find( 'p.last-order' ).show();
			$previewData.find( 'p.order-search' ).hide();
			$previewData.find( 'input[name="preview-order-search"]' ).removeClass( 'active' ).val( '' );
			$previewData.find( '#preview-order-search-results' ).hide();
			$previewData.find( 'img.preview-order-search-clear' ).hide(); // remove the clear button
			resetOrderId()    // force order ID reset
			triggerPreview(); // trigger preview
		}
	} );

	// Preview on page load
	$( document ).ready( triggerPreview() );

	// Preview on user input
	$( document ).on( 'keyup paste', '#wpo-wcpdf-settings input:not([type=checkbox]), #wpo-wcpdf-settings textarea, #wpo-wcpdf-settings select:not(.dropdown-add-field)', function( event ) {
		if ( ! settingIsExcludedForPreview( $( this ).attr( 'name' ) ) ) {
			let duration  = event.type == 'keyup' ? 1000 : 0; 
			triggerPreview( duration );
		}
	} );

	// Preview on user selected option (using 'change' event breaks the PDF render)
	$( document ).on( 'click', '#wpo-wcpdf-settings select:not(.dropdown-add-field) option', function( event ) {
		if ( ! settingIsExcludedForPreview( $( this ).parent().attr( 'name' ) ) ) {
			triggerPreview();
		}
	} );

	// Preview on user checkbox change
	$( document ).on( 'change', '#wpo-wcpdf-settings input[type="checkbox"]', function( event ) {
		if ( ! settingIsExcludedForPreview( $( this ).attr( 'name' ) ) ) {
			triggerPreview( 1000 );
		}
	} );

	// Preview on select / radio setting change
	$( document ).on( 'change', '#wpo-wcpdf-settings input[type="radio"], #wpo-wcpdf-settings select', function( event ) {
		if ( ! settingIsExcludedForPreview( $( this ).attr( 'name' ) ) ) {
			triggerPreview();
		}
	} );

	// Preview on header logo change
	$( document.body ).on( 'wpo-wcpdf-media-upload-setting-updated', function( event, $input ) {
		triggerPreview();
	} );
	$( document ).on( 'click', '.wpo_remove_image_button', function( event ) {
		triggerPreview();
	} );

	// Custom trigger
	$( document ).on( 'wpo_wcpdf_refresh_preview', function( event, duration ) {
		triggerPreview( duration );
	} );

	// Preview on user click in search result
	$( document ).on( 'click', '#preview-order-search-results a', function( event ) {
		event.preventDefault();
		$( '.preview-document .order-search-label').text( '#' + $( this ).data( 'order_id' ) );
		$previewOrderIdInput.val( $( this ).data( 'order_id' ) ).change();
		$( this ).closest( 'div' ).hide();                   // hide results div
		$( this ).closest( 'div' ).children( 'a' ).remove(); // remove all results
		triggerPreview();
	} );

	// Trigger the Preview
	function triggerPreview( timeoutDuration ) {
		loadPreviewData();
		clearTimeout( previewTimeout );
		previewTimeout = setTimeout( function() { ajaxLoadPreview() }, timeoutDuration );
	}

	// Settings excluded from trigger the Preview
	function settingIsExcludedForPreview( settingName ) {
		let excluded = false;
		if ( ! settingName ) {
			return excluded;
		}
		let nameKey = settingName.includes( '[' ) ? settingName.match(/\[(.*?)\]/)[1] : settingName;
		if ( $.inArray( nameKey, wpo_wcpdf_admin.preview_excluded_settings ) !== -1 ) {
			excluded = true;
		}
		return excluded;
	}

	// Clear preview order search results/input
	$( document ).on( 'click', 'img.preview-order-search-clear', function( event ) {
		event.preventDefault();
		$( this ).closest( 'div' ).find( 'input#preview-order-search' ).val( '' );
		$( this ).closest( '.preview-data' ).find( '#preview-order-search-results' ).children( 'a' ).remove();      // remove previous results
		$( this ).closest( '.preview-data' ).find( '#preview-order-search-results' ).children( '.error' ).remove(); // remove previous errors
		$( this ).closest( '.preview-data' ).find( '#preview-order-search-results' ).hide();
		$( this ).hide();
	} );

	// Trigger preview on document selection and change the document type input with the new value
	$( '#wpo-wcpdf-preview-wrapper ul.preview-data-option-list li' ).on( 'click', function() {
		let inputName = $( this ).closest( 'ul' ).data( 'input-name' );
		let $input    = $( '#wpo-wcpdf-preview-wrapper :input[name='+inputName+']');
		$input.val( $( this ).data( 'value' ) ).trigger( 'change' );
	} );

	// Detect document type input changes and apply the same document title to the document selector
	$previewDocumentTypeInput.on( 'change', function() {
		let inputValue = $( this ).val();
		if ( inputValue.length ) {			
			let inputName  = $( this ).attr( 'name' );
			let $ul        = $( '#wpo-wcpdf-preview-wrapper ul.preview-data-option-list[data-input-name='+inputName+']' );
			let $li        = $ul.find( 'li[data-value='+inputValue+']' );
			$ul.parent().find( '.current-label' ).text( $li.text() );
			triggerPreview();
		}
	} ).trigger( 'change' );

	// Detect order ID input changes
	$previewOrderIdInput.on( 'change', function() {
		triggerPreview();
	} ).trigger( 'change' );

	// Load the Preview with AJAX
	function ajaxLoadPreview() {
		let worker   = wpo_wcpdf_admin.pdfjs_worker;
		let canvasId = 'preview-canvas';
		let data     = {
			action:        'wpo_wcpdf_preview',
			security:      previewNonce,
			order_id:      previewOrderId,
			document_type: previewDocumentType,
			data:          previewSettingsFormData,
		};

		// remove previous error notices
		$preview.children( '.notice' ).remove();

		// block ui
		$preview.block( {
			message: null,
			overlayCSS: {
				background: '#fff',
				opacity: 0.6
			}
		} );

		previewXhr = $.ajax( {
			type:    'POST',
			url:     wpo_wcpdf_admin.ajaxurl,
			data:    data,
			beforeSend: function( jqXHR, settings ) {
				if ( previewXhr != null ) {
					previewXhr.abort();
				}
			},
			success: function( response, textStatus, jqXHR ) {
				if ( response.data.error ) {
					$( '#'+canvasId ).remove();
					$preview.append( '<div class="notice notice-error inline"><p>'+response.data.error+'</p></div>' );
				} else if ( response.data.pdf_data ) {
					$( '#'+canvasId ).remove();
					$preview.append( '<canvas id="'+canvasId+'" style="width:100%;"></canvas>' );
					renderPdf( worker, canvasId, response.data.pdf_data );
				}

				$preview.unblock();
			},
			error: function( jqXHR, textStatus, errorThrown ) {
				if ( textStatus != 'abort' ) {
					let errorMessage = jqXHR.status + ': ' + jqXHR.statusText
					$( '#'+canvasId ).remove();
					$preview.append( '<div class="notice notice-error inline"><p>'+errorMessage+'</p></div>' );
					$preview.unblock();
				}
			},
		} );
	}

	// pdf_js (third party library code)
	function renderPdf( worker, canvasId, pdfData ) {
		// atob() is used to convert base64 encoded PDF to binary-like data.
		// (See also https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding.)
		pdfData = window.atob( pdfData );

		// Loaded via <script> tag, create shortcut to access PDF.js exports.
		let pdfjsLib = window['pdfjs-dist/build/pdf'];

		// The workerSrc property shall be specified.
		pdfjsLib.GlobalWorkerOptions.workerSrc = worker;

		// Using DocumentInitParameters object to load binary data.
		let loadingTask = pdfjsLib.getDocument( { data: pdfData } );
		loadingTask.promise.then( function( pdf ) {
			console.log( 'PDF loaded' );
			
			// Fetch the first page
			let pageNumber = 1;
			pdf.getPage( pageNumber ).then( function( page ) {
				console.log( 'Page loaded' );
				
				let scale     = 2;
				let viewport  = page.getViewport( { scale: scale } );

				// Prepare canvas using PDF page dimensions
				let canvas    = document.getElementById( canvasId );
				let context   = canvas.getContext( '2d' );

				canvas.height = viewport.height;
				canvas.width  = viewport.width;

				// Render PDF page into canvas context
				let renderContext = {
					canvasContext: context,
					viewport:      viewport
				};
				let renderTask = page.render( renderContext );
				renderTask.promise.then( function() {
					console.log( 'Page rendered' );
				} );
			} );
		}, function( reason ) {
			// PDF loading error
			console.error( reason );
		} );
	}

	// Preview on user input
	$( '#preview-order-search' ).on( 'keyup paste', function( event ) {
		let $elem = $( this );
		$elem.addClass( 'ajax-waiting' );
		let duration = event.type == 'keyup' ? 1000 : 0;
		loadPreviewData();
		clearTimeout( previewSearchTimeout );
		previewSearchTimeout = setTimeout( function() { previewOrderSearch( $elem ) }, duration );
	} );

	// Preview order search
	function previewOrderSearch( $elem ) {
		let $div   = $elem.closest( '.preview-data' ).find( '#preview-order-search-results' );
		let value  = $elem.val();
		let nonce  = $elem.data( 'nonce' );
		let action = 'wpo_wcpdf_preview_order_search';

		let data = {
			security:      nonce,
			action:        action,
			search:        value,
			document_type: previewDocumentType,
		};

		$div.parent().find( 'img.preview-order-search-clear' ).hide(); // hide the clear button
		$div.children( '.error' ).remove();                            // remove previous errors
		$div.children( 'a' ).remove();                                 // remove previous results
		$div.hide();                                                   // hide search results

		$.ajax( {
			type:    'POST',
			url:     wpo_wcpdf_admin.ajaxurl,
			data:    data,
			success: function( response ) {
				if ( response.data ) {
					if ( response.data.error ) {
						$div.append( '<span class="error">'+response.data.error+'</span>' );
						$div.show();
					} else {
						$.each( response.data, function( i, item ) {
							let firstLine = '<a data-order_id="'+i+'"><span class="order-number">#'+item.order_number+'</span> - '+item.billing_first_name+' '+item.billing_last_name;
							if ( item.billing_company.length > 0 ) {
								firstLine = firstLine+', '+item.billing_company;
							}
							let secondLine = '<br><span class="date">'+item.date_created+'</span><span class="total">'+item.total+'</span></a>';
							$div.append( firstLine+secondLine );
							$div.show();
						} );
					}
				}

				$elem.removeClass( 'ajax-waiting' );
				$elem.closest( 'div' ).find( 'img.preview-order-search-clear' ).show();
			}
		} );
	}

	//----------> /Preview <----------//

} );
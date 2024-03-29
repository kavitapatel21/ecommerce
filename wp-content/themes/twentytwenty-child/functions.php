<?php 
/* Child theme generated with WPS Child Theme Generator */
            
if ( ! function_exists( 'b7ectg_theme_enqueue_styles' ) ) {            
    add_action( 'wp_enqueue_scripts', 'b7ectg_theme_enqueue_styles' );
    
    function b7ectg_theme_enqueue_styles() {
        wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );
        wp_enqueue_style( 'child-style', get_stylesheet_directory_uri() . '/style.css', array( 'parent-style' ) );
    }
}

// Submit Data contact us page
add_action('wp_ajax_data_submit' , 'data_submit');
add_action('wp_ajax_nopriv_data_submit','data_submit');
function data_submit()
{
global $wpdb;
$name = $_POST['name'];
$email = $_POST['email'];
$message = $_POST['message'];
$wpdb->insert("wp_formentry", array(
   "name" => $name,
   "email" => $email,
   "message" => $message,
));
wp_die();
}

/* valid form contact us page*/
function twentytwentyone_add_child_class() {
	?>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
	<script src="http://ajax.aspnetcdn.com/ajax/jquery.validate/1.11.1/jquery.validate.min.js"></script>	
	<script>
	jQuery(document).ready(function () {
		jQuery("#contact").validate({
	        rules: {
	            name: {
	                required:true,
	                maxlength: 20,
	            },
	            email: {
	                required:true,
	                email: true,
					remote: {
           			url: '<?php echo get_stylesheet_directory_uri();?>/template/email.php',
            		type: "post",
       						}
	            },
	        },
			messages: {
            name: "Please enter your fullname",
            email: {
		    required: "Please enter your email address.",
                    email: "Please enter a valid email address.",
                    remote: "email is already exist."
                 },
     },
	    });
		jQuery('#form-submit').click( function()
    {			
		 	var valid = jQuery("#contact").valid();
            var name = jQuery("#name").val();
		 	var email = jQuery("#email").val();
            var message= jQuery("#message").val();
		 	//console.log(valid);
		 	if (valid === true) {		 		
			    jQuery.ajax({
			        url:'<?php echo admin_url( 'admin-ajax.php' ); ?>',
			        type: 'POST',
			        dataType: 'json',	        
			        data:{
			        	action: 'data_submit',
			        	name : name,
						email : email,
						message : message,
			        }, 
			        complete: function () {
						//jQuery('.success').text('Your message was sent successfully');	
                        $('#success').html("<div>Your message was sent successfully</div>").delay(1000).fadeOut(1000);		
					}
			    });
		 	}
		});
	});
	</script>
	<?php
}
add_action( 'wp_footer', 'twentytwentyone_add_child_class' );

/*custom logo*/
add_theme_support( 'custom-logo' );


/*custom favicon*/
function kia_add_favicon(){ ?>
    <!-- Custom Favicons -->
    <link rel="shortcut icon" href="/favicon-32x32.png"/>
    <?php }
add_action('wp_head','kia_add_favicon');

function reigel_woocommerce_checkout_fields( $checkout_fields = array() ) {

    $checkout_fields['order']['date_of_birth'] = array(
        'type'          => 'text',
        'class'         => array('my-field-class form-row-wide'),
        'label'         => __('Date of Birth'),
        'placeholder'   => __('yyyy-mm-dd'),
        'required'      => true, 
        );

    return $checkout_fields;
}
add_filter( 'woocommerce_checkout_fields', 'reigel_woocommerce_checkout_fields' );
function reigel_woocommerce_checkout_update_user_meta( $customer_id, $posted ) {
    if (isset($posted['date_of_birth'])) {
        $dob = sanitize_text_field( $posted['date_of_birth'] );
        update_user_meta( $customer_id, 'date_of_birth', $dob);
    }
}
add_action( 'woocommerce_checkout_update_user_meta', 'reigel_woocommerce_checkout_update_user_meta', 10, 2 );

add_action( 'phpmailer_init', 'setup_phpmailer_init' );
function setup_phpmailer_init( $phpmailer ) {
    $phpmailer->Host = 'smtp.gmail.com'; // for example, smtp.mailtrap.io
    $phpmailer->Port = 465; // set the appropriate port: 465, 2525, etc.
    $phpmailer->Username = 'kavita.patel@plutustec.com'; // your SMTP username
    $phpmailer->Password = 'dkhbr@21'; // your SMTP password
    $phpmailer->SMTPAuth = 'true';
    $phpmailer->SMTPSecure = 'ssl'; // preferable but optional
    $phpmailer->IsSMTP();
}

//cron file
add_filter( 'cron_schedules', 'example_add_cron_interval' );

function example_add_cron_interval( $schedules ) {
	$schedules['sixty_seconds'] = array(
	'interval' => 86400, //[interval] => 86400 once a daily
	'display' => esc_html__( 'Every one minute' ),
	);
   
   return $schedules;
	}

 add_action( 'wp', 'launch_the_action' );
 function launch_the_action(){
	if (!wp_next_scheduled("custom__cron")) {
        wp_schedule_event(time(), "sixty_seconds", "custom__cron");
    }
 }

add_action('custom__cron','get_birthdate');
function get_birthdate() {
	global $wpdb;
	$post_id = $wpdb->get_results("SELECT * FROM wp_usermeta WHERE meta_key = 'date_of_birth'");
	//echo $wpdb->last_query;
	$array = json_decode(json_encode($post_id), true);
	//echo "<pre>";
	//print_r($array);
	foreach ($array as $arr){
		 $result=$arr['meta_value'];
		 $id=$arr['user_id'];
		//echo $id;
		//echo '<br>';
		//echo $result;
		//echo '<br>';
	}
		
		$post= $wpdb->get_results("SELECT email FROM wp_wc_customer_lookup WHERE user_id=$id");
		$email = json_decode(json_encode($post), true);
		//echo "<pre>";
		//print_r($email);
		foreach ($email as $a){
			$mail=$a['email'];
			//echo $mail;
			//echo '<br>';
		}
		$date = new DateTime($result);
		$b= $date->format('m-d'); 
		//echo $b;
		if($b==date('m-d'))
		{	
			$msg = "Hi There,
					Wish You a very happy birthday.On th occassion of your birthday we just want to give a discount coupon.
					The coupon code is '5AV8U4GK'.";
			// use wordwrap() if lines are longer than 70 characters
			$msg = wordwrap($msg,170);
			// send email
			$send=wp_mail("$mail","My subject",$msg);
			//echo "True";
			//echo "<br>";
			if($send)
			{
				//secho "send";
			}
			else{
				//echo "error";
			}
		}
	else{
		//echo "False";
	}      
}
 //add_action( 'init', 'get_birthdate' );


//offer popup
function wpb_demo_shortcode_2() { 
?>
<main>
    <div class="container-fluid bg-trasparent my-4 p-3" style="position: relative;">
        <div class="row row-cols-1 row-cols-xs-2 row-cols-sm-2 row-cols-lg-4 g-3">
		<?php
          $args = array( 'post_type' => 'offer_popup',
          'post_status' => 'publish',
          'posts_per_page' => -1,
          'order'    => 'ASC'); 
          $loop = new WP_Query( $args );
          while ( $loop->have_posts() ) : $loop->the_post(); 
      	?>
            <div class="col">
                <div class="card h-100 shadow-sm"> <img class="card-img-top" alt="" src="<?php echo the_post_thumbnail('thumbnail');?>
                    <div class="card-body">
                        <div class="clearfix mb-3"><h3><?php echo the_title();?></h3></div>
                        <h5 class="card-title"><?php echo the_content();?></h5>
                       <!-- <div class="d-grid gap-2 my-4"><a href="#" class="btn btn-warning">Check offer</a> </div>-->
                    </div>
                </div>
            </div>
			<?php
          	endwhile;
        	?>
        </div>
    </div>
</main>
<?php } ?>
<?php
add_shortcode('my_ad_code', 'wpb_demo_shortcode_2'); 
?>



<?php
//ajax registration form data mail
function invio_mail(){
//echo '<pre>';
// print_r($_POST);
 //echo '</pre>';
 
	$subject='Registration Form';
	$fname=$_POST['fname'];
	$lname=$_POST['lname'];
	$dob=$_POST['dob'];
	$phn=$_POST['phno'];
	$comment=$_POST['comment'];
	$to = $_POST['email'];
	$body  = 'From: Sixteen clothing' ;
	$body .="<html>
	<body>
	<h3>Fistname:". $fname ."</h3>
	<h3>Lastname:". $lname ."</h3>
	<h3>DOB:". $dob ."</h3>
	<h3>Phone No:". $phn ."</h3>
  <h3>Comment:". $comment ."</h3>
	<body>
	</html>";
	$headers = array('Content-Type: text/html; charset=UTF-8','From: kavita <kavita@plutustec.com>');
	 
	//  if(isset($_POST))
	// {
		wp_mail( $to, $subject, $body, $headers );
	//}
  exit();
}
add_action( 'wp_ajax_siteWideMessage', 'invio_mail' );
add_action( 'wp_ajax_nopriv_siteWideMessage', 'invio_mail' );

add_action('wp_footer', 'wp_footer_call');
function wp_footer_call(){
?>
    <script>
     /**    jQuery(document).ready(function() {   
            jQuery('#submit').click( function() {	
              //alert('alert');
                
                     var fname = jQuery('#firstName').val();
                     var lname = jQuery('#lastName').val();
                     var dob = jQuery('#birthdayDate').val();
                     var email = jQuery('#emailAddress').val();
                     var phno = jQuery('#phoneNumber').val();
                     var comment = jQuery('#exampleFormControlTextarea1').val();
            
                $.ajax({
                    type        : 'POST', 
                    url         : "<?php echo admin_url('admin-ajax.php'); ?>",
                    data        : {
			        	action: 'siteWideMessage',
			        	fname : fname,
						    lname : lname,
						    dob : dob,
						    email : email,
						    phno : phno,
                			comment : comment,
			        },
                    dataType    : 'json',
                    encode      : true
                }).done(function(data) {
                    console.log(data);        
                }).fail(function(data) {
                    console.log(data);
                });
                
            });
          });*/

         
    </script>
<?php
}
?>
<?php
/*
 * Shortcode for WooCommerce Cart Icon for Menu Item
 */
add_shortcode ('woocommerce_cart_icon', 'woo_cart_icon' );
function woo_cart_icon() {
    ob_start();
 
        $cart_count = WC()->cart->cart_contents_count; // Set variable for cart item count
        $cart_url = wc_get_cart_url();  // Set variable for Cart URL
  
        echo '<a class="menu-item cart-contents" href="'.$cart_url.'" title="Cart" style="color:white;">';
        
        if ( $cart_count > 0 ) {
        
            echo '<span class="cart-contents-count">'.$cart_count.'</span>';
       
        }
        
        echo '</a>';
        
            
    return ob_get_clean();
 
}

/*
 * Filter with AJAX When Cart Contents Update
 */
add_filter( 'woocommerce_add_to_cart_fragments', 'woo_cart_icon_count' );
function woo_cart_icon_count( $fragments ) {
 
    ob_start();
    
    $cart_count = WC()->cart->cart_contents_count;
    $cart_url = wc_get_cart_url();
    
    
    echo '<a class="cart-contents menu-item" href="'.$cart_url.'" title="View Cart">';
    
    if ( $cart_count > 0 ) {
        
        echo '<span class="cart-contents-count">'.$cart_count.'</span>';
                    
    }
    echo '</a>';
 
    $fragments['a.cart-contents'] = ob_get_clean();
     
    return $fragments;
}


add_filter( 'wp_nav_menu_top-menu_items', 'woo_cart_but_icon', 10, 2 ); // Change menu to suit - example uses 'top-menu'

/**
 * Add WooCommerce Cart Menu Item Shortcode to particular menu
 */
function woo_cart_but_icon ( $items, $args ) {
       $items .=  '[woocommerce_cart_icon]'; // Adding the created Icon via the shortcode already created
       
       return $items;
}
/**function validateotp(){
	?>
<script>
	var otpverify=jQuery('#partitioned').val();
	var getotpcode= jQuery('#mailotp').val();
	if(otpverify != getotpcode){
		  alert('please check your entered email address');
		  return false;
	}
	else{
		alert('OTP is correct');
	}
</script>
<?php
} 
add_action( 'wp_ajax_otpverification', 'validateotp' );
add_action( 'wp_ajax_nopriv_otpverification', 'validateotp' );
*/ 


// custom menu on my account page woocommerce
add_filter ( 'woocommerce_account_menu_items', 'misha_one_more_link' );
function misha_one_more_link( $menu_links ){

	// we will hook "anyuniquetext123" later
	$new = array( 'anyuniquetext123' => 'Points' );
	// array_slice() is good when you want to add an element between the other ones
	$menu_links = array_slice( $menu_links, 0, 1, true ) 
	+ $new 
	+ array_slice( $menu_links, 1, NULL, true );
	return $menu_links;
}
add_action( 'init', 'misha_add_endpoint' );
function misha_add_endpoint() {

	// WP_Rewrite is my Achilles' heel, so please do not ask me for detailed explanation
	add_rewrite_endpoint( 'anyuniquetext123', EP_PAGES );
}
	add_action( 'woocommerce_account_anyuniquetext123_endpoint', 'misha_my_account_endpoint_content' );
function misha_my_account_endpoint_content() {
	
	global $wpdb;
	$current_user_id = get_current_user_id();
	//echo $current_user_id;
	$chk_data = $wpdb->get_results("SELECT points FROM wp_userpoints  WHERE user_id='".$current_user_id ."' ");
	foreach ($chk_data as $key => $value) {
		$data = $value->points;
	}
		echo "<h1>Your points:".$data."</h1>";
		
		
}
?>
<?php 
//to display points on my accout page
function scratchcode_create_payment_table() {
 
    global $wpdb;
 
    $table_name = $wpdb->prefix . "userpoints";
 
    $charset_collate = $wpdb->get_charset_collate();
 
    $sql = "CREATE TABLE IF NOT EXISTS $table_name (
      id bigint(20) NOT NULL AUTO_INCREMENT,
      user_id bigint(20) UNSIGNED NOT NULL,
      points bigint(20) NOT NULL,
      PRIMARY KEY id (id)
    ) $charset_collate;";
 
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}    
add_action('init', 'scratchcode_create_payment_table');

add_filter( 'woocommerce_thankyou_order_received_text', 'misha_thank_you_title', 20, 2 );

function misha_thank_you_title( $thank_you_title, $order ){
	//echo '<pre>';
//	print_r($order);
	$user_id = $order->get_user_id(); 
	$cartitems=$order->get_item_count();	
	//echo $cartitems;
  //  echo $user_id.'<br>';
	echo "Thank you.Your order has been received.";
	global $wpdb;
	$result =  $wpdb->get_results("SELECT * FROM wp_userpoints WHERE user_id='".$user_id."'"); 
	$no=$wpdb->num_rows;
if ($no > 0){
	$chk_data = $wpdb->get_results("SELECT points FROM wp_userpoints WHERE user_id='".$user_id."' ");
	//echo $wpdb->last_result;
	foreach ($chk_data as $key => $value) {
         $data = $value->points;
		 //echo $data;
    }
	if( $data>1){
		$upddata=(10*$cartitems)+$data;    
		//echo $data;       
	$wpdb->update (
		'wp_userpoints',
        array(
            'points'=>$upddata,
           
        ),
		array(
            'user_id'=>$user_id,
        )
       
    );
	}
	
}else{
	$points=10*$cartitems;
	$wpdb->insert('wp_userpoints', array(
		'user_id' => $user_id,
		'points' => $points, 
	));
}
	
}
?>

<?php
//custom post category
function misha_filter_function(){   
	//echo '<pre>';
//print_r($_POST);
//exit();
?>
	

	  <?php
	// $postType = $_POST['type'];
	$catSlug=$_POST['chkbox'];
	//echo $catSlug;
	$args=array(
		'posts_per_page' => 50,    
		'post_type' => 'custom_products',
		'tax_query' => array(
			array(
				'taxonomy' => 'category', //double check your taxonomy name in you dd 
				'field'    => 'id',
				'terms'    => $catSlug,
			),
		   ),
		 );
		 ?>
		 
		 <div class="row col-xl-9 col-lg-9 col-md-12" id="response">
            <div class="row">
		 <?php
		$wp_query = new WP_Query( $args );
	  $response = '';
	  if($wp_query->have_posts()) {
		 // echo "hi";
		 // exit();
		while($wp_query->have_posts()) : $wp_query->the_post();
		?>
		<div class="col-md-3">
		<?php $url = wp_get_attachment_url( get_post_thumbnail_id(), 'thumbnail' ); ?>  
		<img src="<?php echo $url ?>" width="200" height="200" style="padding-top: 20px;" alt=""/>
		<h2 style="padding-top: 5px;text-align:left;"><?php the_title(); ?></h2>
		<h4 style="padding-top: 5px;text-align:left;"><?php the_content(); ?></h4>
		<button type="button" class="btn btn-dark" style="align-items:center">Add to cart</button>
		</div> 
		<?php
		endwhile;
		?>
		 </div>
    </div>
        </div>
</div>
		<?php
	  } else {
		$response = 'empty';
	  }
	  die();
	}
	
	add_action('wp_ajax_misha_filter_function', 'misha_filter_function'); 
	add_action('wp_ajax_nopriv_misha_filter_function', 'misha_filter_function');
?>
<?php
add_action('wp_footer', 'ajaxcall');
function ajaxcall(){
	//for custom post category
	?>
<script>
	jQuery(function($){
		$('#filter').click(function(){
	//	alert('Hi');
	var chkbox = jQuery(".chkbox").val();
	//console.log(chkbox);
	
        $.ajax({
			type: 'POST',
			//dataType: 'json',
            url:'<?php echo admin_url( 'admin-ajax.php' ); ?>',	
            data:
			{
				action: 'misha_filter_function',
				chkbox : chkbox,
			 },// form data
            
            beforeSend:function(xhr){
               // filter.find('button').text('Applying Filters...');   
			       },
            success:function(data){
                //filter.find('button').text('Apply filters');
                $('#response').html(data);
            }
        });
        return false;
    });
});
</script>
<?php
}
?>


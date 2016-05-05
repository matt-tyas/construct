<?php
/**
 * The template for displaying the footer
 *
 * Contains footer content and the closing of the #main and #page div elements.
 *
 * @package WordPress
 * @subpackage Twenty_Fourteen
 * @since Twenty Fourteen 1.0
 */
?>

		</div><!-- #main -->

		</div><!-- #page -->

		<div class="footer-wrap">

			

				<footer id="colophon" class="site-footer scene_element scene_element--fadein" role="contentinfo">

					<div class="footer-inner">

						<div class="grid">
							<div class="grid__item one-third palm-one-whole">
								<?php if ( is_active_sidebar( 'footer-1' ) ) : ?>
									<?php dynamic_sidebar( 'footer-1' ); ?>
								<?php endif; ?>
							</div>
							<div class="grid__item one-third palm-one-whole third--modify">
								<?php if ( is_active_sidebar( 'footer-2' ) ) : ?>
									<?php dynamic_sidebar( 'footer-2' ); ?>
								<?php endif; ?>
							</div>
							<div class="grid__item one-third palm-one-whole">
								<?php if ( is_active_sidebar( 'footer-3' ) ) : ?>
									<?php dynamic_sidebar( 'footer-3' ); ?>
								<?php endif; ?>
							</div>
							
						</div>

					</div>

					<div class="footer-inner-colophon">

						<div class="grid">
							<div class="grid__item one-whole ">
								<div class="colophon">
									<?php if ( is_active_sidebar( 'footer-4' ) ) : ?>
										<?php dynamic_sidebar( 'footer-4' ); ?>
									<?php endif; ?>
								</div>
							</div>
						</div>

					</div>

				</footer><!-- #colophon -->


		</div>

	

</div>

	<script src="<?php echo get_template_directory_uri(); ?>/js/app.js"></script>
	<?php wp_footer(); ?>
</body>
</html>
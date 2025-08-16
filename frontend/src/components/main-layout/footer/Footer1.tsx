import { FaPaperPlane, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { RiInstagramFill } from 'react-icons/ri'
export default function Footer1() {
	return (
		<>
			{/*Start Footer One */}
			<footer className="footer-one" data-scroll-section>
				<div className="shape1">
				<img className="float-bob-y" src="assets/img/shape/footer-v1-shape1.png" alt=""/>
				</div>
				{/*Start Footer Main */}
				<div className="footer-main">
					<div className="container mx-auto px-10">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center">
							
							{/*Start Single Footer Widget */}
							<div className="wow fadeInUp" data-wow-delay=".1s">
								<div className="single-footer-widget footer-widget__about">
								<div className="flex !items-center gap-2">
													<a href="/"> <img src="/assets/img/resource/logo3.png" alt="" className="max-w-[70px] h-auto"/></a>
													<img src="/assets/img/resource/logo3_text.png" alt="IONWARDS" className="h-[40px] relative top-[3px] left-[-5px]"/>
												</div>
									<div className="footer-widget__about-inner">
										<div className="text-box">
											<p>Address 301 Princes Street, Ei class <br />
												Mahall Damietta Egypt-104 </p>
										</div>
										<div className="number-box">
											<a>+1 343 5335 3545</a>
										</div>
										<div className="social-links mt-4">
											<ul className="clearfix list-wrap flex gap-3">
												<li>
													<a href="#" aria-label="LinkedIn" className="flex items-center justify-center w-[35px] h-[35px] bg-[var(--thm-primary)] rounded-full text-[var(--thm-white)] text-[14px] leading-[14px]">
														<i className="fab fa-linkedin-in"><FaLinkedinIn /></i>
													</a>
												</li>
												<li>
													<a href="#" aria-label="Twitter" className="flex items-center justify-center w-[35px] h-[35px] bg-[var(--thm-primary)] rounded-full text-[var(--thm-white)] text-[14px] leading-[14px]">
														<i className="fab fa-twitter"><FaTwitter /></i>
													</a>
												</li>
												<li>
													<a href="#" aria-label="Instagram" className="flex items-center justify-center w-[35px] h-[35px] bg-[var(--thm-primary)] rounded-full text-[var(--thm-white)] text-[14px] leading-[14px]">
														<i className="fab fa-instagram"><RiInstagramFill /></i>
													</a>
												</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
							{/*End Single Footer Widget */}

							{/*Start Single Footer Widget */}
							<div className="wow fadeInUp" data-wow-delay=".2s">
								<div className="single-footer-widget footer-widget__links">
									<div className="title">
										<h2 className="text-lg font-bold">Navigation</h2>
									</div>
									<div className="footer-widget__links-box">
										<ul >
											<li><a>Home</a></li>
											<li><a>About Us</a></li>
											<li><a>Services</a></li>
											<li><a>Contact Us</a></li>
											
										</ul>
									</div>
								</div>
							</div>
							{/*End Single Footer Widget */}

							
							{/*End Single Footer Widget */}

							{/*Start Single Footer Widget */}
							<div className="wow fadeInUp" data-wow-delay=".4s">
								<div className="single-footer-widget footer-widget__newsletter">
									<div className="title">
										<h2 >Newsletter</h2>
									</div>
									<div className="footer-widget__newsletter-box">
										<div className="footer-widget__newsletter-text">
											<p>Subscribe our newsletter to get the <br />
												latest news & updates</p>
										</div>
										<form className="footer-widget__newsletter-form">
											<div className="input-box">
												<input type="email" placeholder="email@example.com" name="email" />
												<button type="submit" className="footer-widget__newsletter-form-btn">
													<i className="icon-telegram"><FaPaperPlane/></i>
												</button>
											</div>
										</form>
									</div>
								</div>
							</div>
							{/*End Single Footer Widget */}
						</div>
					</div>
				</div>
				{/*End Footer Main */}

				{/*Start Footer Bottom */}
				<div className="footer-bottom">
					<div className="container mx-auto">
						<div className="footer-bottom__inner">
							<div className="footer-bottom__text text-center">
								
							</div>
							</div>
						</div>
					</div>
				{/*End Footer Bottom */}
			</footer>
			{/*End Footer One */}
		</>
	);
}


export default function Books() {
    return (
        <>
            {/*Start Project One */}
            <section className="project-one">
                <div className="container mx-auto max-w-[1300px] px-4">
                    <div className="sec-title text-center">
                        <div className="sub-title">
                            <h5>OUR RECENT COURSES</h5>
                        </div>
                        <h2>
                            Books We Designed <br />
                            Check Our Work
                        </h2>
                    </div>
                    <div className="grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 place-items-center">
                        {/*Start Project One Single */}
                        <div className="books_card">
                            <img
                                className="books_card__background "
                                src="/img/books/book_img2.png"
                                alt="Photo of Cartagena's cathedral at the background and some colonial style houses"
                                
                            />
                            <div className="books_card__content | flow">
                                <div className="books_card__content--container | flow">
                                    <h2 className="books_card__title">Colombia <span >Space</span></h2>
                                    <p className="books_card__description">
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipisicing elit. Rerum in labore
                                        laudantium deserunt fugiat numquam.
                                    </p>
                                </div>
                                <button className="books_card__button">Read more</button>
                            </div>
                        </div>
                        {/*End Project One Single */}

                        {/*Start Project One Single */}
                        <div className="books_card">
                            <img
                                className="books_card__background"
                                src="/img/books/book_img3.png"
                                alt="Photo of Cartagena's cathedral at the background and some colonial style houses"
                            
                            />
                            <div className="books_card__content | flow">
                                <div className="books_card__content--container | flow">
                                    <h2 className="books_card__title">Colombia <span >Space</span></h2>
                                    <p className="books_card__description">
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipisicing elit. Rerum in labore
                                        laudantium deserunt fugiat numquam.
                                    </p>
                                </div>
                                <button className="books_card__button">Read more</button>
                            </div>
                        </div>
                        {/*End Project One Single */}

                        {/*Start Project One Single */}
                        <div className="books_card">
                            <img
                                className="books_card__background "
                                src="/img/books/book_img6.jpeg"
                                alt="Photo of Cartagena's cathedral at the background and some colonial style houses"
                                width="1920"
                                height="2193"
                            />
                            <div className="books_card__content | flow">
                                <div className="books_card__content--container | flow">
                                    <h2 className="books_card__title">Colombia <span >Space</span></h2>
                                    <p className="books_card__description">
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipisicing elit. Rerum in labore
                                        laudantium deserunt fugiat numquam.
                                    </p>
                                </div>
                                <button className="books_card__button">Read more</button>
                            </div>
                        </div>
                        {/*End Project One Single */}

                        {/*Start Project One Single */}
                        <div className="books_card">
                            <img
                                className="books_card__background "
                                src="/img/books/book_img5.png"
                                alt="Photo of Cartagena's cathedral at the background and some colonial style houses"
                                width="1920"
                                height="2193"
                            />
                            <div className="books_card__content | flow">
                                <div className="books_card__content--container | flow">
                                    <h2 className="books_card__title">Colombia <span>Space</span></h2>
                                    <p  className="books_card__description">
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipisicing elit. Rerum in labore
                                        laudantium deserunt fugiat numquam.
                                    </p>
                                </div>
                                <button className="books_card__button">Read more</button>
                            </div>
                        </div>
                        {/*End Project One Single */}
                    </div>
                </div>
            </section>
            {/*End Project One */}
        </>
    )
}

import { useState } from "react"
import { Card, Notification, toast } from '@/components/ui'
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa"

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        // Create FormData for Google Forms
        const googleFormData = new FormData();
        
        // Using the actual entry IDs found from your Google Form
        googleFormData.append('entry.881365212', formData.name);        // Name field
        googleFormData.append('entry.655491524', formData.email);       // Email field
        googleFormData.append('entry.1077662461', formData.phone);      // Phone field
        googleFormData.append('entry.1295890556', formData.subject);    // Subject field
        googleFormData.append('entry.422842182', formData.message);     // Message field

        try {
            // Using your Google Form URL
            await fetch(
                'https://docs.google.com/forms/d/1SZAxMP0wi8Pe1P0mp4dlUHEzowGjNl3l_gQO0MYTzSI/formResponse',
                {
                    method: 'POST',
                    mode: 'no-cors',
                    body: googleFormData,
                }
            );
            
            setSubmitStatus('success');
            toast.push(
                <Notification
                    title="Message Sent Successfully!"
                    type="success"
                    duration={4000}
                >
                    Thank you for your message! We will get back to you soon.
                </Notification>
            );
            
            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            setSubmitStatus('error');
            toast.push(
                <Notification
                    title="Error Sending Message"
                    type="danger"
                    duration={4000}
                >
                    Failed to send message. Please try again later.
                </Notification>
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <section className="py-16 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Column - Get in Touch & Contact Info */}
                        <div className="space-y-8">
                            {/* Get in Touch Section */}
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">Get in Touch</h1>
                                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                                    A vast majority of the app marketers mainly concent post-launch app marketing techniques and measures while completely missing pre-launch campaign. This prevents the
                                </p>
                            </div>

                            {/* Contact Info Section */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-red-600">
                                    Contact Info
                                </h2>

                                <div className="space-y-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                                                <FaMapMarkerAlt className="text-white text-lg" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Address</h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                254, North City, Bulex Center, New York
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                                                <FaPhone className="text-white text-lg" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Phone</h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                <a href="tel:+09354587874" className="hover:text-red-600 transition-colors">
                                                    09 (354) 587 874
                                                </a> or <a href="tel:+10698852741" className="hover:text-red-600 transition-colors">
                                                    10 (698) 852 741
                                                </a>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                                                <FaEnvelope className="text-white text-lg" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email</h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                <a href="mailto:info@example.com" className="hover:text-red-600 transition-colors">
                                                    info@example.com
                                                </a> or <a href="mailto:info@example.com" className="hover:text-red-600 transition-colors">
                                                    info@example.com
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Contact Form */}
                        <div>
                            <Card className="p-8 shadow-sm border border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Let's Get in Touch
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-8">
                                    Your email address will not be published. Required fields are marked *
                                </p>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Your Name*"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="Your Email*"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="Phone*"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                id="subject"
                                                name="subject"
                                                type="text"
                                                required
                                                value={formData.subject}
                                                onChange={handleInputChange}
                                                placeholder="Subject*"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows={8}
                                            required
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            placeholder="Write Message*"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none transition-colors"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-8 rounded-md transition-colors duration-300 uppercase tracking-wide ${
                                                submitStatus === 'success' ? 'bg-green-600' : submitStatus === 'error' ? 'bg-red-700' : ''
                                            }`}
                                        >
                                            {isSubmitting 
                                                ? 'SENDING...' 
                                                : submitStatus === 'success' 
                                                ? 'MESSAGE SENT!' 
                                                : submitStatus === 'error' 
                                                ? 'TRY AGAIN' 
                                                : 'SEND MESSAGE'
                                            }
                                        </button>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
export default Contact
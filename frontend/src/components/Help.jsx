import React from 'react';
import '../css/Help.css';  // Add this import

function Help() {
    // FAQ data for cleaner code
    const faqs = [
        {
            id: 1,
            question: "How do I register my club on the platform?",
            answer: [
                "Click on the \"Register Club\" button on the homepage.",
                "Fill in your club details including name, description, category, and contact information.",
                "Upload your club logo and any required verification documents.",
                "Submit your registration for review. You'll receive a confirmation email once approved."
            ]
        },
        {
            id: 2,
            question: "What documents are required for club registration?",
            answer: [
                "Official club registration certificate or incorporation documents.",
                "Club constitution or bylaws.",
                "List of executive committee members with contact details.",
                "Bank account details for financial transactions.",
                "Tax identification number (where applicable)."
            ]
        },
        {
            id: 3,
            question: "How long does the club verification process take?",
            answer: [
                "2-3 business days for initial review and document verification.",
                "You'll receive email notifications at each stage of the verification process.",
                "If additional information is needed, our team will reach out to you directly.",
                "Expedited verification is available for premium club memberships."
            ]
        },
        {
            id: 4,
            question: "Can I edit my club information after registration?",
            answer: [
                "Log in to your club dashboard and navigate to \"Club Settings.\"",
                "Edit your club profile, contact details, and social media links.",
                "Upload new images or update your club description.",
                "Major changes like name or leadership require re-verification."
            ]
        },
        {
            id: 5,
            question: "How do I manage club members and their roles?",
            answer: [
                "Use the \"Member Management\" section in your dashboard to add or remove members.",
                "Assign different roles such as President, Secretary, Treasurer, or General Member.",
                "Send membership invitations via email to prospective members.",
                "Track member attendance and participation in club activities."
            ]
        },
        {
            id: 6,
            question: "What payment methods are accepted for club membership fees?",
            answer: [
                "Mobile money payments (M-Pesa, Airtel Money, Tigo Pesa).",
                "Bank transfers and direct deposits.",
                "Credit and debit card payments (Visa, Mastercard).",
                "PayPal and other digital wallet options.",
                "Annual subscription payments with automatic renewal options."
            ]
        },
        {
            id: 7,
            question: "Is my club's financial information secure on the platform?",
            answer: [
                "All transactions are encrypted using SSL/TLS protocols.",
                "We use secure, PCI-compliant payment gateways.",
                "Regular security audits and vulnerability assessments are performed.",
                "Two-factor authentication is available for enhanced account security.",
                "We never store sensitive payment details on our servers."
            ]
        },
        {
            id: 8,
            question: "How can I promote my club and attract new members?",
            answer: [
                "Create and share club events on the platform's event calendar.",
                "Post updates, photos, and videos on your club's public page.",
                "Use our social media integration to share content across platforms.",
                "Offer referral discounts to existing members who bring in new members.",
                "Feature your club in the \"Club of the Week\" section (premium feature)."
            ]
        },
        {
            id: 9,
            question: "What happens if my club registration is rejected?",
            answer: [
                "Receive a detailed email explaining the reasons for rejection.",
                "Have the opportunity to correct any issues and resubmit.",
                "Contact our support team for guidance on addressing specific concerns.",
                "Appeal the decision through our formal review process.",
                "Request a manual review by our senior verification team."
            ]
        }
    ];

    return (
        <div className="help-page-wrapper">
            <div className="help-container">
                {/* Header */}
                <div className="help-header">
                    <h1>❓ Help Center</h1>
                    <p>Common Club Registration Issues & Solutions</p>
                </div>

                {/* Quick Navigation */}
                <div className="help-nav">
                    <a href="#faq1">Registration</a>
                    <a href="#faq2">Documents</a>
                    <a href="#faq3">Verification</a>
                    <a href="#faq4">Editing</a>
                    <a href="#faq5">Members</a>
                    <a href="#faq6">Payments</a>
                    <a href="#faq7">Security</a>
                    <a href="#faq8">Promotion</a>
                    <a href="#faq9">Rejection</a>
                </div>

                {/* FAQ Items */}
                {faqs.map((faq) => (
                    <div key={faq.id} className="faq-item" id={`faq${faq.id}`}>
                        <div className="faq-question">
                            <span className="question-number">{faq.id}</span>
                            {faq.question}
                        </div>
                        <div className="faq-answer">
                            {faq.answer.map((step, index) => (
                                <span key={index} className="step">{step}</span>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Image Section */}
                <div className="help-image-container">
                    <img 
                        className="help-image" 
                        src='https://media.istockphoto.com/id/1423369897/photo/call-center-worker.jpg?s=612x612&w=0&k=20&c=KaxWNnsroknjxkXjfJijLhmdomOGFt4T-RwUF0qK3hc=' 
                        alt='Club Support Team'
                    />
                    <p className="help-image-caption">
                        Our support team is here to help you 24/7
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Help;
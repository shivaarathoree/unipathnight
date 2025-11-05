import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GradientButton from "./GradientButton.jsx";
import {
  ArrowRight,
  FileText,
  Mail,
  GraduationCap,
  Mic,
  FileSearch,
  TrendingUp,
} from "lucide-react";
import HeroSection from "@/components/hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { features } from "@/data/features";
import { testimonial } from "@/data/testimonial";
import { faqs } from "@/data/faqs";
import { howItWorks } from "@/data/howItWorks";

export default function LandingPage() {
  const growthTools = [
    {
      title: "Build Resume",
      description: "Create professional resumes with AI-powered suggestions",
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      link: "/resume",
    },
    {
      title: "Cover Letter",
      description: "Generate personalized cover letters for job applications",
      icon: <Mail className="h-8 w-8 text-green-500" />,
      link: "/ai-cover-letter",
    },
    {
      title: "Interview Prep",
      description: "Practice interviews with AI-powered mock sessions",
      icon: <GraduationCap className="h-8 w-8 text-purple-500" />,
      link: "/interview",
    },
    {
      title: "Resume Analyzer",
      description: "Get instant AI-powered resume analysis and optimization tips",
      icon: <FileSearch className="h-8 w-8 text-red-500" />,
      link: "/resume-analyzer",
    },
    {
      title: "Industry Insights",
      description: "Explore career paths and industry trends with AI guidance",
      icon: <TrendingUp className="h-8 w-8 text-orange-500" />,
      link: "/dashboard",
    },
    {
      title: "Discover Path",
      description: "Get personalized career roadmap and growth strategies",
      icon: <Mic className="h-8 w-8 text-pink-500" />,
      link: "/career-roadmap",
    },
  ];

  return (
    <>
      {/* Top anchor for smooth scrolling */}
      <div id="top"></div>
      
      <div className="grid-background"></div>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <h2 style={{
                         fontFamily: 'Sk-Modernist-Regular, sans-serif',
                    }}
           className="text-4xl tracking-tighter text-center mb-12" >
            
            Powerful Features for Your Career Growth
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary transition-colors duration-300"
              >
                <CardContent className="pt-6 text-center flex flex-col items-center">
                  <div className="flex flex-col items-center justify-center">
                    {feature.icon}
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Growth Tools Section */}
      <section id="growth-tools" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-4">
            UNIPATH TOOLS
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Built to Elevate Your Path
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {growthTools.map((tool, index) => (
              <Link key={index} href={tool.link} className="block">
                <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full">
                  <CardContent className="pt-6 text-center flex flex-col items-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-4 p-3 bg-muted rounded-full">
                        {tool.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{tool.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {tool.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              <h3 className="text-4xl font-bold">30+</h3>
              <p className="text-muted-foreground">Industries Analyzed</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <h3 className="text-4xl font-bold">1000+</h3>
              <p className="text-muted-foreground">Interview Questions</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <h3 className="text-4xl font-bold">95%</h3>
              <p className="text-muted-foreground">Optimization Accuracy</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <h3 className="text-4xl font-bold">24/7</h3>
              <p className="text-muted-foreground">AI Career Assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Four simple steps to accelerate your career growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howItWorks.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-xl">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT THE TEAM Section */}
      <section id="about-team" className="w-full py-12 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            ABOUT THE TEAM
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonial.map((testimonial, index) => (
              <Card key={index} className="bg-background">
                <CardContent className="pt-6">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative h-12 w-12 flex-shrink-0">
                        <Image
                          width={600}
                          height={600}
                          src={testimonial.image}
                          alt={testimonial.author}
                          className="rounded-full object-cover border-2 border-primary/20"
                        />
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                        <p className="text-sm text-primary">
                          {testimonial.company}
                        </p>
                      </div>
                    </div>
                    <blockquote>
                      <p className="text-muted-foreground italic relative">
                        <span className="text-3xl text-primary absolute -top-4 -left-2">
                          &quot;
                        </span>
                        {testimonial.quote}
                        <span className="text-3xl text-primary absolute -bottom-4">
                          &quot;
                        </span>
                      </p>
                    </blockquote>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Find answers to common questions about our platform
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
     {/* CTA Section */}
<section id="cta-section" className="w-full">
  <div className="mx-auto py-24 gradient rounded-lg">
    <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl md:text-5xl">
        Have Questions or Feedback?
      </h2>
      <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
        We’d love to hear from you! Share your thoughts, suggestions, or inquiries — your feedback helps us improve.
      </p>
      <Link href="mailto:shivarathorecse@gmail.com" passHref>
  <GradientButton />
</Link>

      
    </div>
  </div>
</section>


    </>
  );
}
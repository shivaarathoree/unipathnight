"use client";

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
  MapPin,
  FileSearch,
  TrendingUp,
  Linkedin,
  Instagram,
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
import { motion } from "framer-motion";

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
      icon: <MapPin className="h-8 w-8 text-pink-500" />,
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
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 
              style={{ fontFamily: 'Sk-Modernist-Regular, sans-serif' }}
              className="text-4xl md:text-5xl tracking-tighter text-center mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
            >
             UNIHUB SMART FEATURES
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-5xl mx-auto font-medium">
              Unlock new possibilities in your career with AI tools built to guide and support your next step.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ 
                  duration: 0.7, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                className="h-full"
              >
                <Link href="#growth-tools" className="block h-full">
                  <Card className="border-0 bg-background/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.08)] transition-all duration-500 group relative h-full hover:shadow-[0_0_35px_rgba(0,0,0,0.15)] hover:-translate-y-1">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 z-[-1]"></div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-primary/5 group-hover:via-secondary/2 group-hover:to-primary/5 z-[-1] transition-all duration-700"></div>
                    <CardContent className="pt-10 pb-10 px-6 text-center flex flex-col items-center relative">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-6 p-5 bg-muted rounded-2xl transition-all duration-500">
                          {React.cloneElement(feature.icon, {
                            className: "w-14 h-14 text-primary"
                          })}
                        </div>
                        <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Growth Tools Section */}
      <section id="growth-tools" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-bold tracking-tight text-center mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            UNIPATH TOOLS
          </h2>
         
          <p className="text-center text-lg mb-16 max-w-5xl mx-auto text-foreground/80 font-medium">
            Powerful tools designed to guide your career journey with precision and personalized insights
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {growthTools.map((tool, index) => (
              <div
                key={index}
                className="h-full transition-all duration-500 hover:-translate-y-2"
              >
                <Link href={tool.link} className="block group h-full">
                  <Card className="border-2 h-full bg-background/50 backdrop-blur-sm transition-all duration-500 hover:border-primary hover:shadow-xl hover:-translate-y-2 hover:shadow-primary/25 group-hover:shadow-[0_0_25px_rgba(0,0,0,0.15)] rounded-xl overflow-hidden border-border/50">
                    <CardContent className="pt-8 pb-8 text-center flex flex-col items-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-6 p-4 bg-muted rounded-full transition-all duration-500 group-hover:bg-gradient-to-r from-primary/30 to-secondary/30 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.15)]">
                          {tool.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-3">{tool.title}</h3>
                        <p className="text-muted-foreground text-sm px-4 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
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
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              A streamlined process designed to maximize your career potential with expert guidance at every step
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <Card className="border-0 bg-background/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-all duration-500 group relative">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 z-[-1]"></div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-primary/10 group-hover:via-secondary/5 group-hover:to-primary/5 z-[-1] transition-all duration-500"></div>
                  <CardContent className="pt-8 pb-8 text-center flex flex-col items-center relative">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-6 p-4 bg-muted rounded-full transition-all duration-500 group-hover:bg-gradient-to-r from-primary/20 to-secondary/20 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]">
                        {React.cloneElement(item.icon, {
                          className: "w-12 h-12 text-primary"
                        })}
                      </div>
                      <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                      <p className="text-muted-foreground text-sm px-4 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT THE TEAM Section */}
      <section id="about-team" className="w-full py-12 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">ABOUT THE TEAM</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Meet the passionate individuals behind UNIPATH
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonial.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <Card className="bg-background border-0 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="pt-6 pb-6 text-center">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full overflow-hidden border-2 border-primary/20 w-32 h-32 mx-auto mb-4">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.author}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <h3 className="font-bold mb-1 text-xl">{testimonial.author}</h3>
                      <p className="font-semibold mb-3 text-primary">
                        {testimonial.author === 'Shiva Rathore' ? 'FOUNDER & CEO' : testimonial.author === 'D Tejas' ? 'LEAD DEVELOPER' : 'MANAGER'}
                      </p>
                      
                      <p className="text-muted-foreground text-sm mb-4 px-2">
                        {testimonial.quote}
                      </p>
                      
                      <div className="flex justify-center space-x-3">
                        <Button variant="outline" size="icon" asChild className="rounded-full w-9 h-9">
                          <a href={testimonial.linkedin || "#"} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="outline" size="icon" asChild className="rounded-full w-9 h-9">
                          <a href={testimonial.instagram || "#"} target="_blank" rel="noopener noreferrer">
                            <Instagram className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="outline" size="icon" asChild className="rounded-full w-9 h-9">
                          <a href={`mailto:${testimonial.email || "#"}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
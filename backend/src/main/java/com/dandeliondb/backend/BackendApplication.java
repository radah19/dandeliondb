package com.dandeliondb.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Value("#{'${frontend.urls}'.split(',')}")
            private List<String> frontend_urls;

            @Value("#{'${browser_ext.urls}'.split(',')}")
            private List<String> browser_ext_urls;

            @Override
            public void addCorsMappings(CorsRegistry registry) {
                for (String s: frontend_urls) {
                    registry.addMapping("/**").allowedOrigins(s);
                }

                for (String s: browser_ext_urls) {
                    registry.addMapping("/**").allowedOrigins(s);
                }
            }
        };
    }
}

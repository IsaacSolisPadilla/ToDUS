package com.todus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.todus")
public class TodusApplication {

	public static void main(String[] args) {
		SpringApplication.run(TodusApplication.class, args);
	}

}

package com.todus.util;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/register").permitAll()
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/change-password").authenticated()
                .requestMatchers("/api/images/list").permitAll()
                .requestMatchers("src/main/resources/static/icons/**").permitAll()
                .requestMatchers("/api/images/**").permitAll()
                .requestMatchers("/api/user/profile").authenticated()
                .requestMatchers("/api/user/update").authenticated()
                .requestMatchers("/api/tasks/create").authenticated()
                .requestMatchers("/api/tasks/list").authenticated()
                .requestMatchers("/api/tasks/update/**").authenticated()
                .requestMatchers("/api/tasks/delete/**").authenticated()
                .requestMatchers("/api/categories/create").authenticated()
                .requestMatchers("/api/categories/all").authenticated()
                .requestMatchers("/api/categories/delete/**").authenticated()
                .requestMatchers("/api/categories/update/**").authenticated()
                .requestMatchers("/api/priorities/all").permitAll()
                .requestMatchers("/api/tasks/complete/**").authenticated()
                .requestMatchers("/api/tasks/trash/**").authenticated()
                .requestMatchers("/api/tasks/restore/**").authenticated()
                .requestMatchers("/api/tasks/trash/deleteAll").authenticated()
                .requestMatchers("/api/subtasks/create/**").authenticated()
                .requestMatchers("/api/subtasks/delete/**").authenticated()
                .requestMatchers("/api/subtasks/update/**").authenticated()
                .requestMatchers("/api/subtasks/complete/**").authenticated()
                .requestMatchers("/api/subtasks/list/**").authenticated()
                .requestMatchers("api/priorities/all").permitAll()
                .requestMatchers("api/priorities/create").authenticated()
                .requestMatchers("api/priorities/update/**").authenticated()
                .requestMatchers("api/priorities/delete/**").authenticated()
                .requestMatchers("/api/users/stats").authenticated()
                .requestMatchers("api/priorities/by-user").authenticated()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
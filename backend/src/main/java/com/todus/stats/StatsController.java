package com.todus.stats;

import com.todus.stats.dto.StatsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/stats")
public class StatsController {
    @Autowired
    private StatsService statsService;

    @GetMapping
    public ResponseEntity<StatsDTO> getUserStats(@AuthenticationPrincipal(expression="nickname") String nickname) {
        StatsDTO stats = statsService.getStatsForUser(nickname);
        return ResponseEntity.ok(stats);
    }
}

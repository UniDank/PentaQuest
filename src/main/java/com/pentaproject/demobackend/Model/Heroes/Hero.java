package com.pentaproject.demobackend.Model.Heroes;


import com.pentaproject.demobackend.Model.ClassType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;



@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Document("Hero")
public class Hero {
    private String name;
    private Integer attack;
    private Integer defense;
    private Integer health;
    private Integer mana;
    private Integer agility;
    private Integer APs;
    private Integer range;
    private ClassType category;
}

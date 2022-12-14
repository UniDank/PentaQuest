package com.pentaproject.demobackend.Model.Enemies;

import com.pentaproject.demobackend.Model.Abilities.Ability;

import com.pentaproject.demobackend.Utils.AutoGenEnemy.EnemyPrototype;
import jakarta.persistence.Entity;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.stereotype.Component;


import java.lang.annotation.Annotation;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


//todo: creare una classe astratta entità per favorire la creazione dei nemici tramiti abstract factory method + prototype.

@Setter
@Getter
@Document("enemy")
@AllArgsConstructor
@NoArgsConstructor
public class Enemy  implements EnemyPrototype {
    @Id
    private int id;
    private String name;
    private Integer life;
    private Integer mana;
    private Integer attack;
    private Integer defence;
    private List<Ability> abilitiesList;
    private EnemyType category;

    private Enemy(Enemy clone){
        this.id = -1;
        this.name = clone.name;
        this.life = clone.life;
        this.mana = clone.mana;
        this.attack = clone.attack;
        this.defence = clone.defence;
        this.abilitiesList = clone.getAbilitiesList().stream().toList();
        this.category = clone.category;
    }

    @Override
    public EnemyPrototype clone() {
        return new Enemy(this);
    }
}
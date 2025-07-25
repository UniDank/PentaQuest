package com.pentaproject.demobackend.Services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pentaproject.demobackend.Model.ClassType;
import com.pentaproject.demobackend.Model.Enemies.Enemy;
import com.pentaproject.demobackend.Model.Stage.Stage;
import com.pentaproject.demobackend.Model.Stage.StageSelector;
import com.pentaproject.demobackend.Repositories.EnemyRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Classe Service per la gestione della logica relativa agli oggetti di tipo Enemy
 * @version 1.0
 * @author Marco
 * */

@Service
@AllArgsConstructor
public class EnemyService {
    private EnemyRepository rep;
    private ObjectMapper json;

    public void insertEnemy(Enemy enemy){
        rep.insert(enemy);
    }

    public Enemy getEnemy(int id){
        return rep.findById(id).orElse(null);
    }

    public Enemy generateEnemy(String name, Integer health, Integer mana, Integer attack, Integer defense, Integer agility, Integer APs, Integer range, ClassType category) throws IllegalArgumentException{
        Enemy pippo = new Enemy(name,health,mana,attack,defense,agility,APs,range,category);
        insertEnemy(pippo);
        return pippo;
    }

    public List<Enemy> getEnemies() {
        return rep.findAll();
    }
    
    //TODO: NEED REFACTORY
    /**
     * Metodo per ottenere rispetto id stage, i nemici che fanno parte dello stage
     * @param id id dello stage
     * @return List<Enemy> Lista di nemici 
     * @throws IOException Nel caso non riesce a recuperare il file
     * */
    public List<Enemy> getEnemiesFromStage(int id) throws IOException {
            //de-serealizzazione del file json valuestage, contenente i parametri min-max dei nemici
            File file = new File(".\\valuestage.json"); // .\\valuestage.json
            StageSelector value = json.readValue(file, StageSelector.class);
            Stage stage = value.getStages().stream().filter(x-> x.getId() == id).findFirst().get();
            String[] attack = stage.getAttack().split("-");
            String[] defence = stage.getDefense().split("-");
            String[] life = stage.getHealth().split("-");
            String[] exp = stage.getExpGained().split("-");
            String[] agility = stage.getAgility().split("-");
            boolean boss = stage.isBoss();
            int clone = stage.getClone();
            String[] Entities = stage.getEntity().split(",");
            int enemies = stage.getEnemies();
            
            List<Enemy> template = rep.findBy(Entities);
            Random random = new Random();
            

        //generazione dei nemici con valori causali
        if(!boss){
            return template.stream()
                    .map(enemy -> {
                        enemy.setHealth(random.nextInt(Integer.parseInt(life[0]), Integer.parseInt(life[1])));
                        enemy.setDefense(random.nextInt(Integer.parseInt(defence[0]), Integer.parseInt(defence[1])));
                        enemy.setAttack(random.nextInt(Integer.parseInt(attack[0]), Integer.parseInt(attack[1])));
                        enemy.setAgility(random.nextInt(Integer.parseInt(agility[0]), Integer.parseInt(agility[1])));
                        enemy.setExpReward(random.nextInt(Integer.parseInt(exp[0]), Integer.parseInt(exp[1])));
                        return enemy;
                    })
                    .collect(Collectors.collectingAndThen(
                            Collectors.toList(),
                            collected -> {
                                Collections.shuffle(collected);
                                int j = 0, k = 1;
                                for (int i = 0; i < clone; i++,j++,k++) {
                                    if(j > collected.size()) j = 0;
                                    Enemy c = (Enemy) collected.get(j).clone();
                                    if(!c.getName().contains(" "))
                                        c.setName(c.getName() + " " + k);
                                    else{
                                        c.setName(c.getName().substring(0, c.getName().length()-1)+ k);
                                    }
                                    c.setHealth(random.nextInt(Integer.parseInt(life[0]), Integer.parseInt(life[1])));
                                    c.setDefense(random.nextInt(Integer.parseInt(defence[0]), Integer.parseInt(defence[1])));
                                    c.setAttack(random.nextInt(Integer.parseInt(attack[0]), Integer.parseInt(attack[1])));
                                    c.setAgility(random.nextInt(Integer.parseInt(agility[0]), Integer.parseInt(agility[1])));
                                    c.setExpReward(random.nextInt(Integer.parseInt(exp[0]), Integer.parseInt(exp[1])));
                                    collected.add(c);
                                }
                                return collected.stream();
                            }
                    ))
                    .limit(enemies)
                    .collect(Collectors.toList());
        }
        else {
            Enemy Benemy = template.stream().filter(x-> x.getName().startsWith("Admin")|| x.getName().startsWith("Regitare")).findFirst().get();
            template.remove(Benemy);
            Benemy.setHealth(random.nextInt(Integer.parseInt(life[0]), Integer.parseInt(life[1])));
            Benemy.setDefense(random.nextInt(Integer.parseInt(defence[0]), Integer.parseInt(defence[1])));
            Benemy.setAttack(random.nextInt(Integer.parseInt(attack[0]), Integer.parseInt(attack[1])));
            Benemy.setAgility(random.nextInt(Integer.parseInt(agility[0]), Integer.parseInt(agility[1])));
            Benemy.setExpReward(random.nextInt(Integer.parseInt(exp[0]), Integer.parseInt(exp[1])));
            List<Enemy> result = template.stream()
                    .map(enemy -> {
                        enemy.setHealth(random.nextInt(Integer.parseInt(life[0]), Integer.parseInt(life[1])));
                        enemy.setDefense(random.nextInt(Integer.parseInt(defence[0]), Integer.parseInt(defence[1])));
                        enemy.setAttack(random.nextInt(Integer.parseInt(attack[0]), Integer.parseInt(attack[1])));
                        enemy.setAgility(random.nextInt(Integer.parseInt(agility[0]), Integer.parseInt(agility[1])));
                        enemy.setExpReward(random.nextInt(Integer.parseInt(exp[0]), Integer.parseInt(exp[1])));
                        return enemy;
                    })
                    .collect(Collectors.collectingAndThen(
                            Collectors.toList(),
                            collected -> {
                                Collections.shuffle(collected);
                                int j = 0, k = 1;
                                for (int i = 0; i < clone; i++,j++,k++) {
                                    if(j > collected.size()) j = 0;
                                    Enemy c = (Enemy) collected.get(j).clone();
                                    if(!c.getName().contains(" "))
                                        c.setName(c.getName() + " " + k);
                                    else{
                                        c.setName(c.getName().substring(0, c.getName().length()-1)+ k);
                                    }
                                    c.setHealth(random.nextInt(Integer.parseInt(life[0]), Integer.parseInt(life[1])));
                                    c.setDefense(random.nextInt(Integer.parseInt(defence[0]), Integer.parseInt(defence[1])));
                                    c.setAttack(random.nextInt(Integer.parseInt(attack[0]), Integer.parseInt(attack[1])));
                                    c.setAgility(random.nextInt(Integer.parseInt(agility[0]), Integer.parseInt(agility[1])));
                                    c.setExpReward(random.nextInt(Integer.parseInt(exp[0]), Integer.parseInt(exp[1])));
                                    collected.add(c);
                                }
                                return collected.stream();
                            }
                    ))
                    .limit(enemies - 1)
                    .collect(Collectors.toList());
            result.add(Benemy);
            return result;
            
        }


    }
    
    
    

}

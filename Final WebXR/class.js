import * as THREE from 'three';
import {MeshLine, MeshLineMaterial} from 'three.meshline';

export class FirstBatchedRain {
    constructor(world, dropCount = 200, segments = 5, length = 0.1) {
        this.world = world;
        this.dropCount = dropCount;
        this.segments = segments;
        this.length = length;
        this.totalPoints = dropCount * segments;

        // One big buffer for all points
        this.positions = new Float32Array(this.totalPoints * 3); // 3 = x, y, z

        // Initial drop info
        this.drops = []; // Stores {x, y, z, speed}

        for (let i = 0; i < dropCount; i++) {
            const x = THREE.MathUtils.randFloat(-1, 1);
            const y = THREE.MathUtils.randFloat(0, 1.8);
            const z = -1;
            const speed = THREE.MathUtils.randFloat(-0.005, -0.007);

            this.drops.push({ x, y, z, speed });
            this._updateDropPositions(i, x, y, z);
        }

        // Create geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        const material = new THREE.PointsMaterial({
            color: new THREE.Color('#e31e1e'),
            size: 0.03,
            transparent: true,
            opacity: 0.3,
            depthWrite: false
        });

        this.points = new THREE.Points(geometry, material);
        this.world.add(this.points);
    }

    _updateDropPositions(index, x, y, z) {
        for (let s = 0; s < this.segments; s++) {
            const ratio = s / (this.segments);
            const yOffset = y + ratio * this.length;
            const idx = index * this.segments * 3 + s * 3;
            this.positions[idx + 0] = x;
            this.positions[idx + 1] = yOffset;
            this.positions[idx + 2] = z;
        }
    }

    drop() {
        for (let i = 0; i < this.dropCount; i++) {
            const d = this.drops[i];
            d.y += d.speed;
            if (d.y < -1.5) {
                d.y = THREE.MathUtils.randFloat(1.5, 3);
            }
            this._updateDropPositions(i, d.x, d.y, d.z);
        }

        this.points.geometry.attributes.position.needsUpdate = true;
    }
}

export class SecondBatchedRain {
    constructor(world, count = 100) {
        this.world = world;
        this.count = count;

        this.dummy = new THREE.Object3D();

        // Shared geometry and material
        const radius = THREE.MathUtils.randFloat(0.1, 0.03);// Use a fixed size for instancing
        const geometry = new THREE.CircleGeometry(radius, 32);
        const material = new THREE.MeshBasicMaterial({
            color: '#ed1a1a',
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });

        // Create instanced mesh
        this.mesh = new THREE.InstancedMesh(geometry, material, this.count);
        this.mesh.frustumCulled = false;
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.world.add(this.mesh);

        // Store position and speed for each instance
        this.positions = [];
        this.speeds = [];

        for (let i = 0; i < this.count; i++) {
            const x = -1;
            const y = THREE.MathUtils.randFloat(-1.5, 1.5);
            const z = THREE.MathUtils.randFloat(1, 2) * 2;
            const speed = THREE.MathUtils.randFloat(0.01, 0.02);

            this.positions.push({ x, y, z });
            this.speeds.push(speed);
        }
    }

    drop() {
        for (let i = 0; i < this.count; i++) {
            let pos = this.positions[i];

            pos.z -= this.speeds[i];
            if (pos.z < -1.3) {
                pos.z = THREE.MathUtils.randFloat(1, 2) * 2;
            }

            // Optional: Add jittered scale for variety
            //const scale = THREE.MathUtils.randFloat(0.5, 1.0);

            this.dummy.position.set(pos.x, pos.y, pos.z);
            this.dummy.rotation.y = Math.PI / 2;
            //this.dummy.scale.set(scale, scale, scale);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
        }

        this.mesh.instanceMatrix.needsUpdate = true;
    }
}

export class ThirdBatchedRain {
    constructor(world, count = 100) {
        this.world = world;
        this.count = count;

        // Each line has 2 points => total points = count * 2
        this.positions = new Float32Array(this.count * 2 * 3); // 3 coords per point
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

        this.material = new THREE.LineBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.2
        });

        this.lines = new THREE.LineSegments(this.geometry, this.material);
        this.lines.frustumCulled = false;
        this.world.add(this.lines);

        // Store per-line attributes
        this.origins = [];
        this.speedY = [];
        this.speedZ = [];
        this.lengths = [];

        for (let i = 0; i < this.count; i++) {
            const x = 1;
            const y = THREE.MathUtils.randFloat(-1.5, -1);
            const z = THREE.MathUtils.randFloat(-1.2, -0.8);
            const speedy = THREE.MathUtils.randFloat(0, 0.02);
            const speedz = THREE.MathUtils.randFloat(0, 0.02);
            const length = THREE.MathUtils.randFloat(0.1, 0.2);

            this.origins.push({ x, y, z });
            this.speedY.push(speedy);
            this.speedZ.push(speedz);
            this.lengths.push(length);

            this.setLinePoints(i, x, y, z, speedy, speedz, length);
        }

        this.geometry.attributes.position.needsUpdate = true;
    }
    
    setLinePoints(i, x, y, z, speedy, speedz, length) {
        const startIndex = i * 2 * 3; // 2 points per line, 3 coords each

        // Start point
        this.positions[startIndex] = x;
        this.positions[startIndex + 1] = y;
        this.positions[startIndex + 2] = z;

        // End point
        this.positions[startIndex + 3] = x;
        this.positions[startIndex + 4] = y + (length / (speedz+speedy)) * speedy;
        this.positions[startIndex + 5] = z + (length/ (speedz+speedy))*speedz;
    }

    drop() {
        for (let i = 0; i < this.count; i++) {
            let p = this.origins[i];
            const speedy = this.speedY[i];
            const speedz = this.speedZ[i];
            const length = this.lengths[i];

            p.y += speedy;
            p.z += speedz;

            // Reset if out of bounds
            if (p.y > THREE.MathUtils.randFloat(1.5, 1.7) || p.z > THREE.MathUtils.randFloat(1, 1.2)) {
                p.y = THREE.MathUtils.randFloat(-1.5, -1);
                p.z = THREE.MathUtils.randFloat(-0.8, -1);
            }

            this.setLinePoints(i, p.x, p.y, p.z, speedy, speedz, length);
        }

        this.geometry.attributes.position.needsUpdate = true;
    }
}

export class BeatSineWave {
    constructor(world, x, y, z) {
        this.world = world;
        this.origin = new THREE.Vector3(x, y, z);
        this.z=z;
        this.resolution = 100;
        this.length = 0.3; // 0.1 meters long
        this.spacing = this.length / this.resolution;
        this.points = [];
        for (let i = 0; i < this.resolution; i++) {
            const px = i * this.spacing;
            const py = Math.sin(px*20)*0.05;
            const pz = 0;
            this.points.push(new THREE.Vector3(px, py, pz));
        }

        this.meshLine = new MeshLine();
        const flatPoints =[];
        for(let i=0; i<this.points.length; i++){
            flatPoints.push(this.points[i].x,this.points[i].y,this.points[i].z);
        }
        this.meshLine.setPoints(new Float32Array(flatPoints));

        this.material = new MeshLineMaterial({
            color: new THREE.Color('#eb3434'),
            lineWidth: 0.03,
        });

        this.line = new THREE.Mesh(this.meshLine, this.material);
        this.line.position.copy(this.origin);
        this.world.add(this.line);
    }

    oscillate(time) {
        const flatPoints =[];
        for (let i = 0; i < this.resolution; i++) {
            const x = i * this.spacing;
            const y = Math.sin(x * 20 + time * 5) * 0.05; // adjust frequency and amplitude
            this.points[i].set(x, y, this.z);
            flatPoints.push(x,y,this.z);
        }
        this.meshLine.setPoints(new Float32Array(flatPoints));
    }
}
